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
    constructor(type, sheet=undefined, data=undefined){
        this.sheet=sheet;
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
    constructor(sheetId, sheetName){
        this.sheetId = sheetId;
        this.sheetName = sheetName;
    }
    #data = {
        "row":{},
        "column":{},
        "table":{},
    }
    #cache={
        "table":{},
    }
    sheetName = ""
 
    onchange(e){
        if(e.type == "contentArrayChange"){
            return new msgev("contentArrayChange", e.sheet, {"location":e.data.location, "changed": this.setCellRangeContent(e.data.location, e.data.changed)});
        }else if(e.type=="contentRangeDiscovery"){
            return new msgev("contentArrayChange", e.sheet, {"location":e.data.locationrange.split(":")[0], "changed": this.getCellRangeContent(e.data.locationrange)})
        }
    }

    /**
     * deletes cellrange
     * @param {String} locationrange A1 notation of cellrange or 1 cell
     */
    deleteCellRange(locationrange){
        let locationarray = this.#agregateListFromA1(locationrange);
        locationarray.forEach(element => {
            this.#deleteCell(element);
        });
    }

    /**
     * sets content of cell
     * @param {String} location A1 notation of first cells location
     * @param {Array} new_content new content of cell 
     */
    setCellRangeContent(location, new_content){
        let column = Number().fromBijectiveBase26(location.match(shared.regex.A1column));
        let row = Number(location.match(shared.regex.A1row));
        let max_index = [column + new_content.length-1, row + new_content[0].length-1];
        let i=0;
        while(i<new_content.length){
            let j=0;
            while(j<new_content[0].length){
                this.#setCellContent(Number(column+i).toBijectiveBase26() + String(row+j), new_content[i][j]);
                let computed = this.#compute(new_content[i][j]);
                if(Array.isArray(computed)){
                    if(computed.length + column > max_index[0]){
                        max_index[0] = (computed.length-1) + column;
                    }
                    for (let k = 0; k < computed.length; k++) {
                        if(Array.isArray(computed[k])){
                            if(computed[k].length + row > max_index[1]){
                                max_index[1] = (computed.length-1) + row;
                            }
                            for(let l = 0; l < computed.length; l++) {
                                if(!(l == 0 & k == 0)){
                                    this.#setCellContent(Number(column+i+k).toBijectiveBase26() + String(row+j+l), computed[k][l]);
                                }
                                this.#setCellCacheContent(Number(column+i+k).toBijectiveBase26() + String(row+j+l), computed[k][l]);
                            }
                        }else{
                            if(!(k == 0)){
                                this.#setCellContent(Number(column+i+k).toBijectiveBase26() + String(row+j), computed[k]);
                            }
                            this.#setCellCacheContent(Number(column+i+k).toBijectiveBase26() + String(row+j), computed[k]);
                        }
                    }
                }else{
                    this.#setCellCacheContent(Number(column+i).toBijectiveBase26() + String(row+j), computed);
                }
                j++;
            }
            i++;
        }
        return this.getCellRangeContent(Number(column).toBijectiveBase26() + row  + ":"+ Number(max_index[0]).toBijectiveBase26() + max_index[1], 1);
        
    }

    savedata(){
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
                if(calc === 1){
                    columns.push(this.#getCellCacheContent(locationarray[i][j], reference, false));
                }else{
                    columns.push(this.#getCellContent(locationarray[i][j], calc, reference));
                }
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
            //the raw data has not yet been set
            return null;
        }else{
            let rawdata = this.#data.table[location].content;
            if(calc == 0){
                return rawdata;
            }else{
                let computed = this.#compute(rawdata, reference);
                this.#setCellCacheContent(location, computed);
                return computed;
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
            this.#data.table[location].content=new_content;
        }else{
            let cell = new Cell(new_content);
            this.#data.table[location] = cell;
        }
        return;
    }

    /**
     * deletes cell
     * @param {String} location A1 notation of cells location
     */
    #deleteCell(location){
        if(this.#data.table[location] !== undefined){
            delete this.#data.table[location];
        }
        if(this.#cache.table[location] !== undefined){
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
            this.#cache.table[location].computedcontent=computedcontent;
        }else{
            let cell = new CellCache(computedcontent);
            this.#cache.table[location] = cell;
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
            return this.#cache.table[location].computedcontent;
        }else{
            if(recalc){
                // have to calculate them
                // get raw cell data
                if(this.#data.table[location] !== undefined){
                    rawdata=this.#data.cells.computedcontent;
                    let computed = this.#compute(rawdata);
                    this.#setCellCacheContent(location, computed);
                    return computed;
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
    #compute(string){
        if(string[0] == "="){
            let calculated = mainInterpreter.input(string.slice(1), this.sheetid);
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
        if(locationrange.match(shared.regex.A1range)){
            let results = [];
            let points = locationrange.split(":");
            let columns = [Number().fromBijectiveBase26(points[0].match(shared.regex.A1column)[0]), Number().fromBijectiveBase26(points[1].match(shared.regex.A1column)[0])];
            let rows = [Number(points[0].match(shared.regex.A1row)[0]), Number(points[1].match(shared.regex.A1row)[0])];
            if(rows[0] > rows[1]){
                let helper = rows[0];
                rows[0]=rows[1];
                rows[1]=helper;
            }
            if(columns[0] > columns[1]){
                let helper = columns[0];
                columns[0]=columns[1];
                columns[1]=helper;
            }
            for(let i = columns[0]; i <= columns[1]; i++){
                let columnsArray = Array();
                for(let j = rows[0]; j <= rows[1]; j++){
                    columnsArray.push(Number(i).toBijectiveBase26()+ j);
                }
                results.push(columnsArray);
            }
            return results;
        }else if(locationrange.match(shared.regex.A1)){
            return [[locationrange]];
        }else{
            throw new Error("Not a A1 notation");
        }
    }
};

class dataLayer{
    constructor(){
    }

    sheetspointers ={

    }
    sheets = {

    };
    #generateSheetId(){
        let sheet_id = ""
        for(let i = 0; i<4; i++){
            let number = Math.floor(Math.random()*(shared.alphabet.length*2 + 10)) - 1;
            if(number >= 10){
                number -= 10;
                if(number > shared.alphabet.length){
                    sheet_id += shared.alphabet[number - shared.alphabet.length].toUpperCase();
                }else{
                    sheet_id += shared.alphabet[number];
                }
            }else{
                sheet_id += String(number);
            }
        }
        return sheet_id;
    }
    
    #getSheetByName(name){
        return this.sheets[this.#translatetoSheetId(name)];
    }

    #translatetoSheetId(name){
        if(this.sheetspointers[name] === undefined){
            throw new Error("Spreadsheet does not exists")
        }else{
            return this.sheetspointers[name].sheetId;
        }
    }

    #createSheet(name){
        if(this.sheetspointers[name] !== undefined){
            throw new Error("Name of spreadsheet already used")
        }else{
            let sheet_id = this.#generateSheetId();
            this.sheets[sheet_id] = new Sheet(sheet_id, name);
            this.sheetspointers[name] = {
                "sheetId": sheet_id
            }
        }
    }

    #renameSheet(old_name, new_name){
        if(this.sheetspointers[new_name] !== undefined){
            throw new Error("Name of spreadsheet already used");
        }else if(this.sheetspointers[old_name] === undefined){
            throw new Error("Old Spreadsheet does not exist");
        }else{
            let sheet_id = this.#translatetoSheetId(old_name);
            delete this.sheetspointers[old_name];
            this.sheetspointers[new_name] = {
                "sheetId": sheet_id
            }
            this.sheets[sheet_id].sheetName = new_name;
        }
    }

    #deleteSheet(name){
        if(this.sheetspointers[name] === undefined){
            throw new Error("Spreadsheet does not exist");
        }else{
            let sheet_id = this.#translatetoSheetId(name);
            delete this.sheetspointers[name];
            delete this.sheets[sheet_id];
        }
    }

    onchange(e){
        console.log("io received msg:");
        console.log(e);
        if(e.type=="createSheet"){
            this.#createSheet(e.sheet);
            render.onchange(e);
        }else if(e.type=="deleteSheet"){
            this.#deleteSheet(e.sheet);
            render.onchange(e);
        }else if(e.type=="renameSheet"){
            this.#renameSheet(e.sheet, e.data.new_name);
            render.onchange(e);
        }else{
            let to_return = this.#getSheetByName(e.sheet).onchange(e);
            render.onchange(to_return);
        }
    }
    
}
const dataObject = new dataLayer()