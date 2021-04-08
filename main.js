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

const specialchars = {
    "lock":["\""],
    "escape":["\'"]
}

/**
 * main rendering function
 * @param {String} id 
 */
function input(id){
    console.log(function_or_pl(document.getElementById(id).value));
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
    let function_name = input.slice(0, input.indexOf("(")).trim();
    let param = string_to_param(input.slice(input.indexOf("(") + 1 , input.lastIndexOf(")")));    

    param = parse_param(param);

    return window[function_name](param);
}

/**
 * 
 * @param {String} param string with parameters
 * @returns {Array} array of parameters
 */
function parse_param(param){
    let i = 0;

    while(i < param.length){
        if(param[i].trim().charAt(0) == "["){           //is array
            param[i] = parse_array(param[i]);
        }else{                //is function or expression
            if(typeof param == "string"){
                param = function_or_pl(param);
            }else{
                param[i] = function_or_pl(param[i]);
            }
        }
        i++;
    }
    return param;
}

/**
 * test if input is a function
 * @param {String} string 
 */
 function function_or_pl(string){
    string.trim();
    //solves all () and function()
    while(string.indexOf("(") != -1){ //should be done differently for negative numbers :D
        let pl = 1;
        let bgs = string.indexOf("(");   //technicaly cannot be -1 because of while above
        let i = bgs + 1;
        let lock = 0;
        while(i < string.length && !(pl == 0)){
            if(!lock && string.charAt(i) == "("){
                pl++;
            }else if(!lock && string.charAt(i) == ")" ){
                pl--;
            }else if(specialchars.lock.includes(string.charAt(i))){
                lock++;
                lock=lock%2;
            }else if(specialchars.escape.includes(string.charAt(i))){
                i++;
            }
            i++;
        }
        let name_of_function = selectUntillLastNonabc(string, bgs)
        let func_or_expr = string.slice(bgs, i);
        if(name_of_function != ""){
            func_or_expr = name_of_function + func_or_expr;
            string = string.replace(func_or_expr, parse_function(func_or_expr));
        }else{
            string = string.replace(func_or_expr, parse_param(func_or_expr.slice(1, func_or_expr.length - 1)));
        }
    }
    //now only expresion should stay
    privil = string.match(/\d+\s*[\*\/]\s*\d+/);
    while(privil !== null){
        privil = privil[0];
        let result = "";
        if(privil.includes("*")){
            let array = privil.split("*");
            result = multiply(array);
        }else if(privil.includes("/")){
            let array = privil.split("/");
            result = devide(array);
        }
        string = string.replace(privil, result)
        privil = string.match(/\d+\s*[\*\/]\s*\d+/);
    }
    unprivil = string.match(/\d+\s*[\+\-]\s*\d+/);
    while(unprivil !== null){
        unprivil = unprivil[0];
        let result = "";
        if(unprivil.includes("+")){
            let array = unprivil.split("+");
            result = sum(array);
        }else if(unprivil.includes("-")){
            let array = unprivil.split("-");
            result = substract(array);
        }
        string = string.replace(unprivil, result)
        unprivil = string.match(/\d+\s*[\+\-]\s*\d+/);
    }

    return string;
}

/**
 * splits the string to parameters
 * @param {String} string 
 */
function string_to_param(string){
    let param = new Array();
    let i = 0;
    let lastintristingcharindex = 0;
    let lock = 0;
    let pl = 0;
    let pl2 =0;

    while(i < string.length){
        if(!lock && string.charAt(i) == "["){
            pl2++;
        }else if(!lock && string.charAt(i) == "]" ){
            pl2--;
        }else if(!lock && string.charAt(i) == "("){
            pl++;
        }else if(!lock && string.charAt(i) == ")" ){
            pl--;
        }else if(pl == 0 && pl2 == 0 && specialchars.lock.includes(string.charAt(i))){
            lock++;
            lock=lock%2;
        }else if(pl == 0 && pl2 == 0 && !lock){
            if(string.charAt(i)==","){
                param.push(string.slice(lastintristingcharindex, i));
                lastintristingcharindex = i + 1;
            }else if(specialchars.escape.includes(string.charAt(i))){
                i++;
            }
        }

        i++;
    }
    const last = string.slice(lastintristingcharindex)
    if(last != ""){
        param.push(last);
    }
    return param;
}

/**
 * select the last alphabetical character before position in string
 * @param {String} string string to process 
 * @param {Number} pos index of position to begin on
 * @returns {String} of alphabtical chracters before nonalphabetical
 */
function selectUntillLastNonabc(string, pos){
    string = string.slice(0, pos);
    let result = string.match(/[a-zA-Z]+$/);
    if(result != null){
        result = result[0];
    }else{
        result = "";
    }
    return result;
}