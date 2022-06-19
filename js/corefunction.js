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
class CoreFunctions{
    //aliases
    product(input){
        return this.multiply(input);
    }
    //end of aliases 

    /**
     * converts sth to number
     * @param {String|Number} input
     * @returns {Number}
     */
    toNumber(input){
        let result = new Number;
        if(typeof input == "number"){
            result = input;
        }else if(typeof input == "string"){
            
        }
    }

    getBaseLog(x, y) {
        return Math.log(y) / Math.log(x);
    }  

    /**
    * just testing function
    * @param {Array} arrayin array of input 
    * @returns {Array} =arrayin
    */

    test(arrayin){
        return arrayin;
    }

    flatDeep(arr) {//should be remade
        let d = Infinity;
        return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? this.flatDeep(val, d - 1) : val), [])
                    : arr.slice();
    };

    /**
     * sums all the number in Array (array in array will by sumed to)
     * @param {Array|Number} input
     * @returns {Number} sum of input
     */
    sum(input){
        let result = 0;
        input = this.flatDeep(input);
        input.forEach(element => {
            result = Number(result) + Number(element);
        })
        if(typeof input == "number"){
            result = input;
        }
        return result;
    }

    /**
     * substract all the number in Array from the first one (array in array will by used to to)
     * @param {Array|Number} input
     * @returns {Number}
     */
    substract(input){
        let result = 0;
        if(typeof input[0] !== undefined){
            result = input[0];
            input.shift();
        }
        if(typeof input == "object"){
            input = this.flatDeep(input);
            input.forEach(element => {
                result = Number(result) - Number(element);
            });
        }else if(typeof input == "number"){
            result = input;
        }
        return result;
    }

    /**
     * multiply all the number in Array (array in array will by multiplyed to)
     * @param {Array|Number} input
     * @returns {Number} sum of input
     */
    multiply(input){
        let result = 1;
        if(typeof input == "object"){
            input = this.flatDeep(input);
            input.forEach(element => {
                result = Number(result) * Number(element);
            })
        }
        if(typeof input == "number"){
            result = input;
        }
        return result;
    }

    /**
     * divide all the number in Array from the first one (numbers in array will by used to to divide)
     * @param {Array|Number} input
     * @returns {Number}
     */
    divide(input){
        let result = 0;
        if(typeof input == "object"){
            input = this.flatDeep(input);
            if(typeof input[0] !== undefined){
                result = input[0];
                input.shift();
            }
            input.forEach(element => {
                result = Number(result) / Number(element);
            });
        }else if(typeof input == "number"){
            result = input;
        }
        return result;
    }
} 