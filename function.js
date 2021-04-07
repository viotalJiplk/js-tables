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
function suma(input){
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