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
// TODO:
// impement dependencies of cell
// implement styling

class msgev{
    constructor(type, data){
        this.type=type;
        this.data = data;
    }
}

class Cell{
    constructor(content = undefined){
        this.content = content;
    }
    type = "";
    style = {};
    content = undefined;
}

class CellCache{
    constructor(computedcontent){
        this.computedcontent = computedcontent;
    }
}

class Sheet{
    #regex ={
        A1: /[A-Z]+\d+/,
        A1column: /[A-Z]+/,
        A1row: /\d+/,
        A1range: /[A-Z]+\d+:[A-Z]+\d+/
    }
    #data = {
        "row":{},
        "column":{},
        "table":{},
        "cells":[]
    }
    #cache={
        "table":{},
        "cells":[]
    }
 
    onchange(e){
        if(e.type == "contentArrayChange"){
            render.onchange(new msgev("contentArrayChange", {"location":e.data.location, "changed": this.setCellRangeContent(e.data.location, e.data.changed)}));
        }else if(e.type=="contentRangeDiscovery"){
            render.onchange(new msgev("contentArrayChange", {"location":e.data.locationrange.split(":")[0], "changed": this.getCellRangeContent(e.data.locationrange)}))
        }
    }

    /**
     * deletes cellrange
     * @param {String} locationrange A1 notation of cellrange or 1 cell
     */
    deleteCellRange(locationrange){
        return this.#agregateListFromA1(locationrange, this.#deleteCell);
    }

    /**
     * sets content of cell
     * @param {String} location A1 notation of first cells location
     * @param {Array} new_content new content of cell 
     */
    setCellRangeContent(location, new_content){
        let result = [];
        let column = Number().fromBijectiveBase26(location.match(this.#regex.A1column));
        let row = Number(location.match(this.#regex.A1row));
        let i=0;
        while(i<new_content.length){
            let columns = [];
            let j=0;
            while(j<new_content[0].length){
                columns.push(this.#setCellContent(Number(column+i).toBijectiveBase26() + String(row+j), new_content[i][j]));
                j++;
            }
            result.push(columns);
            i++;
        }
        return result;
        
    }

    save(){
        return this.#data;
    }

    /**
     * gets content of cells in cellrange
     * @param {String} locationrange A1 notation of cellrange or 1 cell
     * @param {Number} calc should the value be calculated? 0 - display raw, 1 - return cached if avalible, >1 - return recalculated values 
     * @param {String} reference A1 notation of location of cell which depends on this cell for interpreter mainly
     * @returns content of cell or null if cell does not exist
     */
    getCellRangeContent(locationrange, calc=0, reference=undefined){
        let locationarray = this.#agregateListFromA1(locationrange);
        let result = [];
        for(let i=0; i<locationarray.length; i++){
            let columns = [];
            for(let j=0; j<locationarray[i].length; j++){
                columns.push(this.#getCellContent(locationarray[i][j], calc, reference));
            }
            result.push(columns);
        }
        return result;
    }


    /**
     * gets content of cell
     * @param {String} location A1 notation of cells location
     * @param {Boolean} calc should the value be calculated? 0 - display raw, 1 - return cached if avalible, >1 - return recalculated values 
     * @param {String} reference A1 notation of location of cell which depends on this cell for interpreter mainly
     * @returns content of cell or null if cell does not exist
     */
    #getCellContent(location, calc=0, reference=undefined){
        if(this.#data.table[location] === undefined){
            //the data has not yet been set in reference table
            return null;
        }else{
            let rawdata = this.#data.cells[this.#data.table[location].index].content;
            if(calc == 0){
                return rawdata;
            }else if(calc == 1){
                return this.#getCellCacheContent(location, reference);
            }else{
                return this.#compute(location, rawdata, reference);
            }
        }
    }

    /**
     * sets content of cell
     * @param {String} location A1 notation of cells location
     * @param {*} new_content new content of cell 
     */
    #setCellContent(location, new_content){
        if(this.#data.table[location] !== undefined){
            this.#data.cells[this.#data.table[location].index].content=new_content;
        }else{
            let cell = new Cell(new_content);
            this.#data.table[location] = {
                "index": this.#data.cells.push(cell) - 1
            };
        }
        return this.#compute(location, new_content, undefined);
    }

    /**
     * deletes cell
     * @param {String} location A1 notation of cells location
     */
    #deleteCell(location){
        if(this.#data.table[location] !== undefined){
            delete this.#data.cells[this.#data.table[location]];
            delete this.#data.table[location];
        }
        if(this.#cache.table[location] !== undefined){
            delete this.#cache.cells[this.cache.table[location]];
            delete this.#cache.table[location];
        }
    }

    /**
     * sets computedcontent to cellcache
     * @param {String} location A1 notation of cells location
     * @param {*} computedcontent new content of cell 
     */
    #setCellCacheContent(location, computedcontent){
        if(this.#cache.table[location] !== undefined){
            this.#cache.cells[this.#cache.table[location].index].computedcontent=computedcontent;
        }else{
            let cell = new CellCache(computedcontent);
            this.#cache.table[location] = {
                "index": this.#cache.cells.push(cell) - 1
            };
        }
    }

    /**
     * gets cachedcomputedcontent of cell
     * @param {String} location A1 notation of cells location
     * @param {Boolean} recalc should the value be recalculated?
     * @param {String} reference A1 notation of location of cell which depends on this cell for interpreter mainly
     * @returns cachedcomputedcontent of cell or null if cell does not exist
     */
    #getCellCacheContent(location, reference, recalc=true){
        if(this.#cache.table[location] !== undefined){
            return this.#cache.cells[this.#data.table[location].index].computedcontent;
        }else{
            if(recalc){
                // have to calculate them
                // get raw cell data
                if(this.#data.table[location] !== undefined){
                    rawdata=this.#data.cells[this.#data.table[location].index].computedcontent;
                    return this.#compute(location, rawdata, reference);
                }else{
                    return null;
                }
            }else{
                return null;
            }
        }
    }
    
    /**
     * computes the value of cell and saves it to cache 
     * @param {string} location 
     * @param {*} string 
     * @param {*} reference 
     * @returns 
     */
    #compute(location, string, reference){
        if(string[0] == "="){
            let calculated = function_or_pl(string.slice(1));
            this.#setCellCacheContent(location, calculated);
            return calculated;
        }else{
            return string;
        }
    }

    /**
     * 
     * @param {String} locationrange
     * @returns {Array}
     */
    #agregateListFromA1(locationrange){
        locationrange =  locationrange.trim();
        if(locationrange.match(this.#regex.A1range)){
            let results = [];
            let points = locationrange.split(":");
            let columns = [Number().fromBijectiveBase26(points[0].match(this.#regex.A1column)), Number().fromBijectiveBase26(points[1].match(this.#regex.A1column))];
            let rows = [Number(points[0].match(this.#regex.A1row)), Number(points[1].match(this.#regex.A1row))];
            if(rows[0] > rows[1]){
                let helper = row[0];
                row[0]=row[1];
                row[1]=helper;
            }
            if(columns[0] > columns[1]){
                let helper = columns[0];
                columns[0]=columns[1];
                columns[1]=helper;
            }
            for(let i = columns[0]; i <= columns[1]; i++){
                let columns = Array();
                for(let j = rows[0]; j <= rows[1]; j++){
                    columns.push(Number(i).toBijectiveBase26()+ j);
                }
                results.push(columns);
            }
            return results;
        }else if(locationrange.match(this.#regex.A1)){
            return [[locationrange]];
        }else{
            throw new Error("Not a A1 notation");
        }
    }
};
const sheet1 = new Sheet();