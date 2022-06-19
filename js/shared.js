const shared = {
  "regex":{
    "A1": /[A-Z]+\d+/,
    "A1column": /[A-Z]+/,
    "A1row": /\d+/,
    "A1range": /[A-Z]+\d+:[A-Z]+\d+/
  }
}

// inspiration https://github.com/ptrkcsk/BB26/blob/main/source/to-decimal.ts
Number.prototype.fromBijectiveBase26 = (function(string){
	if (!/[A-Z]/.test(string)) {
		throw new Error('String must contain only upper-case characters');
	}

	let number = 0;

	for(let i = 0; i < string.length; i++) {
		const char = string[string.length - i - 1];
        if(i == 0){
            number += Number((char.charCodeAt(0) - 'A'.charCodeAt(0)) + 1);
        }else{
		    number += Number(26 * i * ((char.charCodeAt(0) - 'A'.charCodeAt(0)) + 1));
        }
    }

	return Number(number);
});


//stolen from https://github.com/alexfeseto/hexavigesimal/blob/master/hexavigesimal.js
Number.prototype.toBijectiveBase26 = (function () {
    return function toBijectiveBase26() {
      n = this+1;
      ret = "";
      while(parseInt(n)>0){
        --n;
        ret += String.fromCharCode("A".charCodeAt(0)+(n%26)-1);
        n/=26;
      }
      return ret.split("").reverse().join("");
    };
}());