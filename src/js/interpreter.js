/*@licstart  The following is the entire license notice for the 
JavaScript code in this page.

Copyright (C) 2021 Vojtech Varecha
Copyright (C) 2021 Jan Křehlík

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

@licend  The above is the entire license notice
for the JavaScript code in this page.
*/

class Interpreter {
    #interpreter_regex ={
        "string": /(?<!\\)"((\\\\)|(\\")|[^"])*(?<!\\)"/gm,
        "function_orExpr": /[a-zA-Z]*\([^\(\[\]\)]*\)|\[[^\(\[\]\)]*\]/, //matches expretion, function, array
        "function": /^[a-zA-Z]+\([^()]*\)$/,
        "param": /(?<=\(|\,)[^),]+/g,
        "stringplaceholder": /^%s\d+$/,
        "arrayplaceholder": /^%a\d+$/,
        "extractnumber":/\d+/,
        "expr": /^\(?(\s*(((\(\s*([\+\-](\d+)+(\.(\d+)+)?)\))|((\d+)+(\.(\d+)+)?))\s*[\+\-\*\/]\s*)+((\(\s*([\+\-](\d+)+(\.(\d+)+)?)\))|((\d+)+(\.(\d+)+)?)))\)?\s*$/, //regexp to decide if it is expr 
        "array": /\[[^\(\[\]\)]*\]/,
        "solveexpr":{
            "exprnumber": /(\d\s*)+(\.\s*(\d\s*)+)?|((?<=\()(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)(?=\)))/gm,
            "exprmultiply" : /\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))\s*[\*]\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))/m,
            "exprdivision": /\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))\s*[\/]\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))/m,
            "exprsum": /\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))\s*[\+]\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))/m,
            "exprsubstract": /\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))\s*[\-]\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))/m
        }
    }

    #core = new CoreFunctions;
    #functionfeaturelist = [new CoreFunctions];


    /**
     * 
     * @param {Array} paramin 
     *
    */
    input(string, sheet_name){
        //moves string out of string
        const classontext = this;
        let Astrings = [];
        let AAray = []

        function solveexpr(string){
            //solve all multiplications
            {
                let multiplic = string.match(classontext.#interpreter_regex.solveexpr.exprmultiply);
                while(multiplic !== null){
                    multiplic = multiplic[0];
                    let result = "";
                    let array = multiplic.match(classontext.#interpreter_regex.solveexpr.exprnumber);
                    result = classontext.#core.MULTIPLY(array);
                    if(result < 0){
                        result = "(" + result + ")";
                    }
                    string = string.replace(multiplic, result);
                    multiplic = string.match(classontext.#interpreter_regex.solveexpr.exprmultiply);
                }
            }
            //solve all divisions
            {
                let division = string.match(classontext.#interpreter_regex.solveexpr.exprdivision);
                while(division !== null){
                    division = division[0];
                    let result = "";
                    let array = division.match(classontext.#interpreter_regex.solveexpr.exprnumber);
                    result = classontext.#core.DIVIDE(array);
                    if(result < 0){
                        result = "(" + result + ")";
                    }
                    string = string.replace(division, result);
                    division = string.match(classontext.#interpreter_regex.solveexpr.exprdivision);
                }
            }
            //solve all sums
            {
                let suma = string.match(classontext.#interpreter_regex.solveexpr.exprsum);
                while(suma !== null){
                    suma = suma[0];
                    let result = "";
                    let array = suma.match(classontext.#interpreter_regex.solveexpr.exprnumber);
                    result = classontext.#core.SUM(array);
                    if(result < 0){
                        result = "(" + result + ")";
                    }
                    string = string.replace(suma, result);
                    suma = string.match(classontext.#interpreter_regex.solveexpr.exprsum);
                }
            }
            //solve all subtractions
            {
                let substraction = string.match(classontext.#interpreter_regex.solveexpr.exprsubstract);
                while(substraction !== null){
                    substraction = substraction[0];
                    let result = "";
                    let array = substraction.match(classontext.#interpreter_regex.solveexpr.exprnumber);
                    result = classontext.#core.SUBSTRACT(array);
                    if(result < 0){
                        result = "(" + result + ")";
                    }
                    string = string.replace(substraction, result);
                    substraction = string.match(classontext.#interpreter_regex.solveexpr.exprsubstract);
                }
            }
            string = string.replace("(", "");
            string = string.replace(")", "");
            //we should check there if thing witch we are returning is number (throw error if not)
            return string;
        }

        function prepareparam(paramin, Astrings, AAray){
            let outparam = [];
            paramin.forEach(element => {
                element = element.trim();
                if(element.match(classontext.#interpreter_regex.stringplaceholder)){
                    outparam.push(Astrings[element.match(classontext.#interpreter_regex.extractnumber)]);
                }else if(element.match(classontext.#interpreter_regex.arrayplaceholder)){
                    outparam.push(AAray[element.match(classontext.#interpreter_regex.extractnumber)]);
                }else if(!Number.isNaN(Number(element))){
                    outparam.push(Number(element));
                }else if(element.match(classontext.#interpreter_regex.expr)){
                    outparam.push(Number(solveexpr(element.match(classontext.#interpreter_regex.expr)[0])));
                }
            });
            return outparam;
        }

        /**
         * parses the string and calls the functions 
         * main functionality function
         * @param {String} input string to parse
         */
        function call_function(function_name, param){
            let result;
            let sucess = 0;
            
            let i = 0;
            while(i < classontext.#functionfeaturelist.length & !sucess){
                if(function_name in classontext.#functionfeaturelist[i]){
                    result = classontext.#functionfeaturelist[i][function_name](param);
                    sucess = 1;
                }
                i++;
            }
            if(!sucess){
                throw new Error("Function \"" + function_name + "\" does not exist");
            }
            return result;
        }

        function stringreplacer(matched_string){
            return "%s" + (Astrings.push(String(matched_string.slice(1, matched_string.length -1)))- 1);
        }
        function stringreturner(matched_string){
            let index = matched_string.match(classontext.#interpreter_regex.extractnumber)[0];
            return Astrings[index];
        }
        function arraayreturner(matched_string){
            let index = matched_string.match(classontext.#interpreter_regex.extractnumber)[0];
            return JSON.stringify(AAray[index]);
        }

        function function_or_pl_replacer(matched_string){
            if(matched_string.match(classontext.#interpreter_regex.function)){
                let function_name = matched_string.slice(0, matched_string.indexOf("(")).trim();
                let params = prepareparam(matched_string.match(classontext.#interpreter_regex.param), Astrings, AAray);
                let result = call_function(function_name, params)
                if(typeof result == "object"){
                    result = "%a" + (AAray.push(result) - 1);
                }else if(typeof result == "string"){
                    result = "%s" + (Astrings.push(result) - 1);
                }
                return result;
                
            }else if(matched_string.match(classontext.#interpreter_regex.expr)){
                return solveexpr(matched_string);
            }else if(matched_string.match(classontext.#interpreter_regex.array)){
                let array = prepareparam(matched_string.slice(1, matched_string.length -1).split(","), Astrings, AAray);
                return "%a" + (AAray.push(array)-1);
            }
        }

        string = string.replace(this.#interpreter_regex.string, stringreplacer);
        while(string.match(this.#interpreter_regex.function_orExpr)){
            string = string.replace(this.#interpreter_regex.function_orExpr, function_or_pl_replacer);
        }
        if(string.match(this.#interpreter_regex.expr)){
            string = solveexpr(string);
        }


        //replace placeholders with values
        let match = string.trim().match(this.#interpreter_regex.arrayplaceholder); //if return = "%a1"
        if(match){
            string = AAray[match[0].match(this.#interpreter_regex.extractnumber)[0]];
        }else{
            string = string.replace(this.#interpreter_regex.arrayplaceholder, arraayreturner)
            string = string.replace(this.#interpreter_regex.stringplaceholder, stringreturner);
        }
        
        return string;
    }
}
const  mainInterpreter = new Interpreter();