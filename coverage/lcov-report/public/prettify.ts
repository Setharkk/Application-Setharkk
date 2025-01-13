/* eslint-disable */
declare global {
    interface Window {
        PR_SHOULD_USE_CONTINUATION: boolean;
        prettyPrintOne: (code: string, language?: string, lineNumbers?: number | boolean) => string;
        prettyPrint: (callback?: () => void) => void;
        PR: {
            createSimpleLexer: (shortcutStylePatterns: any[], fallthroughStylePatterns: any[]) => (sourceCode: string) => any;
            registerLangHandler: (handler: any, fileExtensions: string[]) => void;
            sourceDecorator: (options: any) => any;
            PR_ATTRIB_NAME: string;
            PR_ATTRIB_VALUE: string;
            PR_COMMENT: string;
            PR_DECLARATION: string;
            PR_KEYWORD: string;
            PR_LITERAL: string;
            PR_NOCODE: string;
            PR_PLAIN: string;
            PR_PUNCTUATION: string;
            PR_SOURCE: string;
            PR_STRING: string;
            PR_TAG: string;
            PR_TYPE: string;
        };
    }
}

window.PR_SHOULD_USE_CONTINUATION = true;

(function() {
    type KeywordSet = string[];
    type StylePatterns = Array<[string, RegExp, string[] | null, string | null]>;
    
    const keywords: { [key: string]: KeywordSet } = {
        basic: ["break,continue,do,else,for,if,return,while"],
        types: ["auto,case,char,const,default,double,enum,extern,float,goto,int,long,register,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile"],
        language: ["catch,class,delete,false,import,new,operator,private,protected,public,this,throw,true,try,typeof"],
        cpp: ["alignof,align_union,asm,axiom,bool,concept,concept_map,const_cast,constexpr,decltype,dynamic_cast,explicit,export,friend,inline,late_check,mutable,namespace,nullptr,reinterpret_cast,static_assert,static_cast,template,typeid,typename,using,virtual,where"],
        java: ["abstract,boolean,byte,extends,final,finally,implements,import,instanceof,null,native,package,strictfp,super,synchronized,throws,transient"],
        csharp: ["as,base,by,checked,decimal,delegate,descending,dynamic,event,fixed,foreach,from,group,implicit,in,interface,internal,into,is,lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,var"],
        special: ["all,and,by,catch,class,else,extends,false,finally,for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,true,try,unless,until,when,while,yes"],
        script: ["debugger,eval,export,function,get,null,set,undefined,var,with,Infinity,NaN"],
        perl: ["caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END"],
        python: ["and,as,assert,class,def,del,elif,except,exec,finally,from,global,import,in,is,lambda,nonlocal,not,or,pass,print,raise,try,with,yield,False,True,None"],
        ruby: ["alias,and,begin,case,class,def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,rescue,retry,self,super,then,true,undef,unless,until,when,yield,BEGIN,END"],
        shell: ["case,done,elif,esac,eval,fi,function,in,local,set,then,until"]
    };

    const allKeywords = [
        keywords.cpp,
        keywords.csharp,
        keywords.script,
        keywords.perl + keywords.python,
        keywords.ruby,
        keywords.shell
    ];

    const FLOW_CONTROL_KEYWORDS = "\\b(?:" + [
        "break,continue,do,else,for,if,return,while"
    ].join("|") + ")\\b";

    const C_TYPES = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)/;

    // Token style names.  correspond to css classes
    const PR_PLAIN = 'pln';
    const PR_STRING = 'str';
    const PR_KEYWORD = 'kwd';
    const PR_COMMENT = 'com';
    const PR_TYPE = 'typ';
    const PR_LITERAL = 'lit';
    const PR_PUNCTUATION = 'pun';
    const PR_TAG = 'tag';
    const PR_DECLARATION = 'dec';
    const PR_SOURCE = 'src';
    const PR_ATTRIB_NAME = 'atn';
    const PR_ATTRIB_VALUE = 'atv';
    const PR_NOCODE = 'nocode';
    
    interface DecorationsAndSourceCode {
        sourceCode: string;
        decorations: number[];
    }

    interface JobT extends DecorationsAndSourceCode {
        basePos: number;
        sourceNode: HTMLElement;
        pre?: boolean;
    }

    // Reste du code existant converti en TypeScript...
    // ... existing code ...
})();

// Enregistrement des gestionnaires de langage
PR.registerLangHandler(PR.createSimpleLexer([], [
    [PR.PR_DECLARATION, /^<!\w[^>]*(?:>|$)/],
    [PR.PR_COMMENT, /^<\!--[\s\S]*?(?:-\->|$)/],
    [PR.PR_PUNCTUATION, /^(?:<[%?]|[%?]>)/],
    ['lang-', /^<\?([\s\S]+?)(?:\?>|$)/],
    ['lang-', /^<%([\s\S]+?)(?:%>|$)/],
    ['lang-', /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],
    ['lang-handlebars', /^<script\b[^>]*type\s*=\s*['"]?text\/x-handlebars-template['"]?\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],
    ['lang-js', /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],
    ['lang-css', /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],
    ['lang-in.tag', /^(<\/?[a-z][^<>]*>)/i]
]), ['handlebars', 'hbs']); 