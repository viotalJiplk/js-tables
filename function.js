/*@licstart  The following is the entire license notice for the 
JavaScript code in this page.

Copyright (C) 2021 Vojtech Varecha
Copyright (C) 2021 Jan Krehlik

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

/**
* just testing function
* @param {Array} arrayin array of input 
* @returns {Array} =arrayin
*/
function test(arrayin){
    return arrayin;
}

/**
 * 
 * @param {Array|Number} input 
 */
function sum(input){
    let result = 0;
    if(typeof input == "object"){
        input.forEach(element => {
            if(typeof element == "object"){
                result = Number(result) + Number(suma(element));
            }
            if(!isNaN(element)){
                result = Number(result) + Number(element);
            }
        })
    }
    if(typeof input == "number"){
        result = input;
    }
    return result;
}

function substract(input){
    let result = 0;
    if(typeof input == "object"){
        if(input[0] != "undefined"){
            if(typeof input[0] == "object"){
                input[0].unshift(0);
                result = Number(substract(input[0]));
            }else if(!isNaN(input[0])){
                result = Number(input[0]);
            }
            input.shift();
        }
        input.forEach(element => {
            if(typeof element == "object"){
                element.unshift(0);
                result = Number(result) + Number(substract(element));
            }
            if(!isNaN(element)){
                result = Number(result) - Number(element);
            }
        })
    }else if(typeof input == "number"){
        result = input;
    }
    return result;
}