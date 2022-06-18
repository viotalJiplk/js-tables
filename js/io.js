// TODO:
// impement dependencies of cell
// implement styling

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
    /**
     * gets content of cell
     * @param {String} location A1 notation of cells location
     * @param {Boolean} calc should the value be calculated? 0 - display raw, 1 - return cached if avalible, >1 - return recalculated values 
     * @param {String} reference A1 notation of location of cell which depends on this cell for interpreter mainly
     * @returns content of cell or null if cell does not exist
     */
    getCellContent(location, calc=0, reference=undefined){
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
    setCellContent(location, new_content){
        let calculated = "";
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
    deleteCell(location){
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
    #compute(location, string, reference){
        if(string[0] == "="){
            let calculated = function_or_pl(string.slice(1));
            this.#setCellCacheContent(location, calculated);
            return calculated;
        }else{
            return string;
        }
    }
};
const sheet1 = new Sheet();

