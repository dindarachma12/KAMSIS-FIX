const plainText = document.querySelector('#plaintext')
const key = document.querySelector('#key')
const chipertext = document.querySelector('#chipertext')
const coverImage = document.querySelector('#coverImage')
const textBefore = document.querySelector('.text-before')
const textAfter = document.querySelector('.text-after')
const stegoImage = document.querySelector('#stegoImage')
const keyDecrypt = document.querySelector('#keyDecrypt')
const textStegoImage = document.querySelector('.textStegoImage')
const resultDecrypt = document.querySelector('#resultDecrypt')
const shiftDecrypt = document.querySelector('.shiftDecrypt')
let resultCoverImage

const canvas = document.getElementById( 'canvas' )
const canvasAfter = document.querySelector('#canvasAfter')
const canvasDecrypt = document.getElementById('canvasDecrypt')
const ctx = canvas.getContext("2d")
const ctxAfter = canvasAfter.getContext("2d")
const ctxDecrypt = canvasDecrypt.getContext("2d")
let clampedArray
let index = 0;

// Function Encrypt

const encryptCrypto = () => {
   setTimeout(() => {
   if(plainText.value === '' || key.value === '') {
      chipertext.value = ''

      return;
   }
   const result = caesarShift(plainText.value, parseInt(key.value))
   chipertext.value = result
   }, 400);
}

var caesarShift = function (str, amount) {
   if (amount < 0) {
      return caesarShift(str, amount + 26);
   }

   var output = "";
   for (var i = 0; i < str.length; i++) {
   var c = str[i];
   if (c.match(/[a-z]/i)) {
      var code = str.charCodeAt(i);
      console.log('code', code)
      if (code >= 65 && code <= 90) {
         c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
      }
      else if (code >= 97 && code <= 122) {
         c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
      }
   }

   output += c;
   }

   return output;
};

const handleCoverImage = (e) => {
   let extension = coverImage.value.substring(coverImage.value.lastIndexOf('.')  + 1)
   if (extension == "gif" || extension == "png" || extension == "bmp" || extension == "jpeg" || extension == "jpg") {
      if (e.files && e.files[0]) {
         var reader = new FileReader();
         let img = new Image()
         
         reader.onload = function(e) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            img.src = e.target.result
            checkTextBefore()
         };       
         reader.onloadend =() => {
            ctx.drawImage( img,  0, 0, img.width, img.height,
                                 0, 0, canvas.width, canvas.height);
         }
      }
      reader.readAsDataURL(coverImage.files[0]);
   }
}

const checkTextBefore = () => {
   if(textBefore.value !== '') {
      return textBefore.innerHTML = 'Before'
   }
   
   return 
}

const checkTextAfter = () => {
   if(textAfter.value !== '') {
      return textAfter.innerHTML = 'After (Click right and save image)'
   }
   return
}

const handleCombine = () => {
   if(plainText.value === '') {
      chipertext.innerHTML = ''
      return alert('Plaintext masih kosong!')
   } else if(key.value === '') {
      chipertext.innerHTML = ''
      return alert('Key masih kosong!')
   } else if(coverImage.value === '') {
      return alert('Cover Image masih kosong!')
   } else if (chipertext.value === '') {
      return alert('Chipertext masih kosong!')
   }


   let extension = coverImage.value.substring(coverImage.value.lastIndexOf('.')  + 1)
   if (extension == "gif" || extension == "png" || extension == "bmp" || extension == "jpeg" || extension == "jpg") {
      checkTextAfter()
      
      let fr = new FileReader()

      fr.addEventListener('load', console.info('load just start.. wait for finish'))
      fr.addEventListener('loadend', (e) => {
         let img = new Image()
         img.src = e.target.result


         img.onload = function() {
            clampedArray = ctx.getImageData( 0, 0, canvas.width, canvas.height );
            readByte( arrayBuffer(chipertext.value) );
            ctxAfter.putImageData(clampedArray, 0, 0);
         }
      })
      fr.readAsDataURL(coverImage.files[0])
   }
}

// Function Decrypt
const handleStegoImage = (e) => {
   let extension = stegoImage.value.substring(stegoImage.value.lastIndexOf('.')  + 1)
   if (extension == "gif" || extension == "png" || extension == "bmp" || extension == "jpeg" || extension == "jpg") {
      if (e.files && e.files[0]) {
         var reader = new FileReader();
         let img = new Image()
         
         reader.onload = function(e) {
            ctxDecrypt.clearRect(0, 0, canvasDecrypt.width, canvasDecrypt.height)
            img.src = e.target.result
         };
         
         reader.onloadend =(e) => {          
            ctxDecrypt.drawImage( img,  0, 0, img.width, img.height,
                                 0, 0, canvasDecrypt.width, canvasDecrypt.height);
            
            shiftDecrypt.style.marginTop = '10px'
            canvasDecrypt.style.minHeight = "220px"
                        
         }

      reader.readAsDataURL(stegoImage.files[0]);
      }
   }
}

const handleDecrypt = () => {
   if(stegoImage.value === '') return alert('upload stego image terlebih dahulu!')
   if(keyDecrypt.value === '') return alert('isi field key terlebih dahulu!')

   let extension = stegoImage.value.substring(stegoImage.value.lastIndexOf('.')  + 1)
   
   if (extension == "gif" || extension == "png" || extension == "bmp" || extension == "jpeg" || extension == "jpg") {
      if (stegoImage.files && stegoImage.files[0]) {
         var file = stegoImage.files[0];
         console.log('file', file)
         var fr = new FileReader();

         fr.addEventListener( "loadend", loadEndEvent );

         function loadEndEvent ( e ) {

            var img = new Image();
            img.src = e.target.result;
            img.onload = function () {

                  var loadView = ctxDecrypt.getImageData( 0, 0, canvasDecrypt.width, canvasDecrypt.height );
                  console.log('load', loadView.data.length )
                  var totalLength = 0;
                  var lastIndex;

                  for ( var b = 0, viewLength = loadView.data.length; b < viewLength; b++ ) {
                     if (loadView.data[ b ] == 255) {
                        totalLength += loadView.data[ b ];
                        if (loadView.data[ b + 1 ] < 255) {
                              totalLength += loadView.data[ b + 1 ];
                              lastIndex = b + 1;
                              break;
                        }
                     } else {
                        totalLength += loadView.data[ b ];
                        lastIndex = b;
                        break;
                     }
                  }
                  console.info( 'Total length :' + totalLength + ', Last Index : ' + lastIndex )
                  var secretLength = totalLength;

                  var newUint8Array = new Uint8Array( totalLength / 4 );
                  var j = 0;
                  for ( var i = ( lastIndex + 1 ); i < secretLength; i = i + 4 ) {
                     var aShift = ( loadView.data[ i ] & 3 );
                     var bShift = ( loadView.data[ i + 1 ] & 3 ) << 2;
                     var cShift = ( loadView.data[ i + 2 ] & 3 ) << 4;
                     var dShift = ( loadView.data[ i + 3 ] & 3 ) << 6;
                     var result = ( ( ( aShift | bShift) | cShift ) | dShift );
                     newUint8Array[ j ] = result;
                     j++;
                  }
                  
                  let dec = new TextDecoder()
                  let res = dec.decode(newUint8Array)
                  let shift = Math.sign(keyDecrypt.value) >= 0 ?  parseInt(`-${keyDecrypt.value}`) : parseInt(keyDecrypt.value)
                  const resultDecode = caesarShift(res, shift)
                  console.log('shift', shift)
                  console.log('resultDecode', resultDecode)
                  resultDecrypt.value = resultDecode
            }
         }
         fr.readAsDataURL( file );
      }
   }


}

const arrayBuffer = (str) => {
   let enc = new TextEncoder()
   return enc.encode(str)
}


function readByte( secret ) {
   for ( var i = 0, length = secret.length; i < length; i++ ) {
      if ( i == 0 ) {
            var secretLength = length * 4;
            console.info( 'Secret Length(' + length + 'x4) : ' + secretLength )
            if ( secretLength > 255 ) {
               var division = secretLength / 255;
               if ( division % 1 === 0 ) {
                  for ( var k = 0; k < division; k++ ) {
                        clampedArray.data[ k ] = 255;
                        index++;
                  }
               }
               else {

                  var firstPortion = division.toString().split(".")[ 0 ];
                  var secondPortion = division.toString().split(".")[ 1 ];

                  for ( var k = 0; k < firstPortion; k++ ) {
                        clampedArray.data[ k ] = 255;
                        index++;
                  }

                  var numberLeft = Math.round( ( division - firstPortion ) * 255 );
                  console.info( 'numberLeft : ' + numberLeft )
                  clampedArray.data[ k ] = numberLeft;
                  index++;
               }

            } else {
               clampedArray.data[ 0 ] = secretLength;
               index++;
            }

            console.log( 'sss : ' + clampedArray.data[ 0 ] )

      }

      var asciiCode = secret[ i ];
      var first2bit = ( asciiCode & 0x03 ); // 0x03 = 3
      var first4bitMiddle = ( asciiCode & 0x0C ) >> 2;
      var first6bitMiddle = ( asciiCode & 0x30 ) >> 4;
      var first8bitMiddle = ( asciiCode & 0xC0 ) >> 6;

      replaceByte( first2bit );
      replaceByte( first4bitMiddle );
      replaceByte( first6bitMiddle );
      replaceByte( first8bitMiddle );


   }
}


function replaceByte ( bits ) { 
   clampedArray.data[ index ] = ( clampedArray.data[ index ] & 0xFC ) | bits;
   index++;

}


const reset = () => {
   plainText.value = ''
   key.value = ''
   chipertext.value = ''
   coverImage.value = ''
   textBefore.innerHTML = ''
   textAfter.innerHTML = ''
   ctx.clearRect(0, 0, canvas.width, canvas.height)
   ctxAfter.clearRect(0, 0, canvasAfter.width, canvasAfter.height)
}

const resetDcrypt = () => {
   stegoImage.value = ''
   keyDecrypt.value = ''
   resultDecrypt.value = ''
   ctxDecrypt.clearRect(0, 0, canvasDecrypt.width, canvasDecrypt.height)
   shiftDecrypt.style.marginTop = '-20px'
   canvasDecrypt.style.maxHeight = "0px"
   canvasDecrypt.style.minHeight = "0px"
}