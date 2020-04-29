const compileUtils= {
    getVal(expr,vm){//person.name
        return expr.split('.').reduce((data,current)=>{
            return data[current]
        },vm.data)
    },
    text(node,vm,expr){
        let value
        if(expr.indexOf('{{')!==-1){
            value = expr.replace(/\{\{(.+?)\}\}/g,(...argus)=>{
                return this.getVal(argus[1],vm)
            })
        } else{
            value = this.getVal(expr,vm)
        }
        this.updater.getText(node,value)
    },
    html(node,vm,expr){
        const value = this.getVal(expr,vm)
        new Watcher(vm,expr,(newVal)=>{
            console.log('newVal',newVal)
            this.updater.getHtml(node,newVal)
        })
        this.updater.getHtml(node,value)
    },
    model(node,vm,expr){
        const value = this.getVal(expr,vm)
        new Watcher(vm,expr,(newVal)=>{
            this.updater.getModel(node,newVal)
        })
        node.addEventListener('input',(e)=>{
            this.setVal(expr,vm,e.target.value)
        })
        this.updater.getModel(node,value)
    },
    on(node,vm,expr,eventName){
        let fn = vm.methods && vm.methods[expr]
        node.addEventListener(eventName,fn.bind(vm),false)
    },
    setVal(expr,vm,value){
        expr.split('.').reduce((data,current)=>{
            data[current]=value
        },vm.data)
    },
    updater:{
        getText(node,value){
            node.textContent = value
        },
        getHtml(node,value){
            node.innerHTML = value
        },
        getModel(node,value){
            node.value = value
        }
    }
}

class Compile{
    constructor(el,data,vm){
        this.vm = vm
        this.el = this.isNodeEvent(el)?el:document.querySelector(el);
        const fragment = this.getFragment(this.el)
        this.compile(fragment)
        this.el.appendChild(fragment)
    }
    compile(fragment){
        //获取子节点
        const childNodes = fragment.childNodes;
        [...childNodes].forEach(child=>{
           
            if(this.isNodeEvent(child)){
                this.compileEvent(child)
            } else {
                this.compileText(child)
            }
            if(child.childNodes&&child.childNodes.length){
                this.compile(child)
            }
        })
        //console.log('childNodes',childNodes)

    }
    compileEvent(node){
        let attributes = node.attributes;
        //attributes 是类数组，->数组
        [...attributes].forEach(attr=>{
            //console.log('attr',attr)
           // console.log(typeof attr)
            let {name,value} = attr
            if(this.starWith(name)){
                //name v-text v-html v-model v-on:click
                let [,methods] = name.split('-')//text,html,model,on:click
                let [methodName,eventName] =methods.split(':')
                compileUtils[methodName](node,this.vm,value,eventName)

            } else if(this.starWith2(name)){
                console.log('@akitou')
            }
            //console.log(name)
        })
      
    }
    starWith(str){
        return str.startsWith('v-')
    }
    starWith2(str){
        return str.startsWith('@')
    }
    compileText(node){
        const content = node.textContent;
        if(/\{\{(.+?)\}\}/.test(content)){
            compileUtils['text'](node,this.vm,content)
        }
        //console.log('元素节点',node)
    }
    getFragment(el){
        const f = document.createDocumentFragment();
        let firstChild
        while(firstChild = el.firstChild){
            f.appendChild(firstChild)
        }
        return f
    }
    isNodeEvent(node){
        return node.nodeType ===1
    }
}

class Vue{
    constructor(obj){
        this.el = obj.el;
        this.data = obj.data;
        this.obj = obj
        if(this.el){
            new Observe(this.data)
            new  Compile(this.el,this.data,this.obj)
        }
    }
}
