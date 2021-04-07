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
    console.log(parse_function(document.getElementById(id).value));
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
 * 
 * @param {String} param string with parameters
 * @returns {Array} array of parameters
 */
function parse_param(param){
    let i = 0;

    while(i < param.length){
        param[i] = param[i].trimStart();
        if(param[i].charAt(0) == "["){
            param[i] = parse_array(param[i]);
        }else if(param[i].charAt(0) != "\"" && param[i].includes("(")){
            param[i] = parse_function(param[i]);
        }
        i++;
    }
    return param;
}

/**
 * parses the string and calls the functions 
 * main functionality function
 * @param {String} input string to parse
 */
function parse_function(input){
    let function_name = input.slice(0, input.indexOf("("));
    let param = string_to_param(input.slice(input.indexOf("(") + 1 , input.lastIndexOf(")")));    

    param = parse_param(param);

    return window[function_name](param);

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