class Watcher{
    constructor(vm,expr,callback){
        this.expr=expr ,
        this.vm  =vm;
        this.callback = callback;
        this.oldVal = this.getOldVal()
    }
    getOldVal(){
        Dep.target = this;
        const oldVal = compileUtils.getVal(this.expr,this.vm)
        return oldVal
    }
    updater(){
        const newVal  = compileUtils.getVal(this.expr,this.vm);
        if(newVal!==this.oldVal){
            this.callback(newVal)
        }
    }
}

class Dep{
    constructor(){
        this.subs = []
    }
    addWatcher(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(w=>w.updater())
    }
}

class Observe{
    constructor(data){
        this.observe(data)
    }  
    observe(data){
        if(typeof data ==='object'){
            Object.keys(data).forEach(key=>{
                this.proxy(data,key,data[key])
            })
        }
    } 
    proxy(data,key,value){
        this.observe(value)
        const dep = new Dep()
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable:false,
            get(){
                Dep.target && dep.addWatcher(Dep.target)
                return value
            },
            set(newval){
                if(newval!==value){
                    value = newval
                }
                dep.notify()
            }
        })
    }
}