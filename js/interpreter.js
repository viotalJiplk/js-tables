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

//todo move to json config file
let interpreter_regex ={
    "string": /(?<!\\)"((\\\\)|(\\")|[^"])*(?<!\\)"/gm,
    "function_orExpr": /[a-zA-Z]*\([^\(\[\]\)]*\)|\[[^\(\[\]\)]*\]/, //matches expretion, function, array
    "function": /^[a-zA-Z]+\([^()]*\)$/,
    "param": /(?<=\(|\,)[^),]+/g,
    "stringplaceholder": /^%s\d+$/,
    "arrayplaceholder": /^%a\d+$/,
    "extractnumber":/\d+/,
    "expr": /^(\s*(((\(\s*([\+\-](\d+)+(\.(\d+)+)?)\))|((\d+)+(\.(\d+)+)?))\s*[\+\-\*\/]\s*)+((\(\s*([\+\-](\d+)+(\.(\d+)+)?)\))|((\d+)+(\.(\d+)+)?)))\s*$/, //regexp to decide if it is expr 
    "array": /\[[^\(\[\]\)]*\]/
}

core = new CoreFunctions;
functionfeaturelist = [new CoreFunctions];


/**
 * 
 * @param {Array} paramin 
 *
*/
function prepareparam(paramin, Astrings, AAray){
    let outparam = [];
    paramin.forEach(element => {
        element = element.trim();
        if(element.match(interpreter_regex.stringplaceholder)){
            outparam.push(Astrings[element.match(interpreter_regex.extractnumber)]);
        }else if(element.match(interpreter_regex.arrayplaceholder)){
            outparam.push(AAray[element.match(interpreter_regex.extractnumber)]);
        }else if(!Number.isNaN(Number(element))){
            outparam.push(Number(element));
        }else if(element.match(interpreter_regex.expr)){
            outparam.push(Number(solveexpr(element.match(interpreter_regex.expr)[0])));
        }
    });
    return outparam;
}
function input(string, sheet_id){
    //moves string out of string
    let Astrings = [];
    let AAray = []

    /**
     * parses the string and calls the functions 
     * main functionality function
     * @param {String} input string to parse
     */
    function call_function(function_name, param){
        let result;
        let sucess = 0;
        
        let i = 0;
        while(i < functionfeaturelist.length & !sucess){
            if(function_name in functionfeaturelist[i]){
                result = functionfeaturelist[i][function_name](param);
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
        let index = matched_string.match(interpreter_regex.extractnumber)[0];
        return Astrings[index];
    }
    function arraayreturner(matched_string){
        let index = matched_string.match(interpreter_regex.extractnumber)[0];
        return JSON.stringify(AAray[index]);
    }

    function function_or_pl_replacer(matched_string){
        if(matched_string.match(interpreter_regex.function)){
            let function_name = matched_string.slice(0, matched_string.indexOf("(")).trim();
            params = prepareparam(matched_string.match(interpreter_regex.param), Astrings, AAray);
            result = call_function(function_name, params)
            if(typeof result == "object"){
                result = "%a" + (AAray.push(result) - 1);
            }else if(typeof result == "string"){
                result = "%s" + (Astrings.push(result) - 1);
            }
            return result;
            
        }else if(matched_string.match(interpreter_regex.expr)){
            return solveexpr(matched_string);
        }else if(matched_string.match(interpreter_regex.array)){
            array = prepareparam(matched_string.slice(1, matched_string.length -1).split(","), Astrings, AAray);
            return "%a" + (AAray.push(array)-1);
        }
    }
    string = string.replace(interpreter_regex.string, stringreplacer);
    while(string.match(interpreter_regex.function_orExpr)){
        string = string.replace(interpreter_regex.function_orExpr, function_or_pl_replacer);
    }


    //replace placeholders with values
    let match = string.trim().match(interpreter_regex.arrayplaceholder); //if return = "%a1"
    if(match){
        string = AAray[match[0].match(interpreter_regex.extractnumber)[0]];
    }else{
        string = string.replace(interpreter_regex.arrayplaceholder, arraayreturner)
        string = string.replace(interpreter_regex.stringplaceholder, stringreturner);
    }
    
    return string;     
}


/**
 * function to pase array from string
 * @param {String} string string begining with 
 */
function parse_array(input){
    let param = string_to_param(input.slice(input.indexOf("[") + 1 , input.lastIndexOf("]")));

    param = parse_param(param);

    return param;
}

/**
 * parses the string and calls the functions 
 * main functionality function
 * @param {String} input string to parse
 */
 function parse_function(input){
    let result;
    let sucess = 0;
    let function_name = input.slice(0, input.indexOf("(")).trim();
    let param = string_to_param(input.slice(input.indexOf("(") + 1 , input.lastIndexOf(")")));    

    param = parse_param(param);
    
    let i = 0;
    while(i < functionfeaturelist.length & !sucess){
        if(function_name in functionfeaturelist[i]){
            result = functionfeaturelist[i][function_name](param);
            sucess = 1;
        }
        i++;
    }
    if(!sucess){
        throw new Error("Function \"" + function_name + "\" does not exist");
    }
    return result;
}

function solveexpr(string){
    //solve all multiplications
    let regex_number = /(\d\s*)+(\.\s*(\d\s*)+)?|((?<=\()(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)(?=\)))/gm;
    {
        const regex_multiply = /\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))\s*[\*]\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))/m;
        let multiplic = string.match(regex_multiply);
        while(multiplic !== null){
            multiplic = multiplic[0];
            let result = "";
            let array = multiplic.match(regex_number);
            result = core.MULTIPLY(array);
            if(result < 0){
                result = "(" + result + ")";
            }
            string = string.replace(multiplic, result);
            multiplic = string.match(regex_multiply);
        }
    }
    //solve all divisions
    {
        const regex_division = /\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))\s*[\/]\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))/m;
        let division = string.match(regex_division);
        while(division !== null){
            division = division[0];
            let result = "";
            let array = division.match(regex_number);
            result = core.DIVIDE(array);
            if(result < 0){
                result = "(" + result + ")";
            }
            string = string.replace(division, result);
            division = string.match(regex_division);
        }
    }
    //solve all sums
    {
        const regex_sum = /\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))\s*[\+]\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))/m;
        let suma = string.match(regex_sum);
        while(suma !== null){
            suma = suma[0];
            let result = "";
            let array = suma.match(regex_number);
            result = core.SUM(array);
            if(result < 0){
                result = "(" + result + ")";
            }
            string = string.replace(suma, result);
            suma = string.match(regex_sum);
        }
    }
    //solve all subtractions
    {
        const regex_substract = /\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))\s*[\-]\s*((\d\s*)+(\.\s*(\d\s*)+)?|(\(\s*[\+\-]\s*(\d\s*)+(\.\s*(\d\s*)+)?)\))/m;
        let substraction = string.match(regex_substract);
        while(substraction !== null){
            substraction = substraction[0];
            let result = "";
            let array = substraction.match(regex_number);
            result = core.SUBSTRACT(array);
            if(result < 0){
                result = "(" + result + ")";
            }
            string = string.replace(substraction, result);
            substraction = string.match(regex_substract);
        }
    }
    string = string.replace("(", "");
    string = string.replace(")", "");
    //we should check there if thing witch we are returning is number (throw error if not)
    return string;
}