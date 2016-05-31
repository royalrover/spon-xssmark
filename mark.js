/**
 * Created by showjoy on 16/5/31.
 */
module.exports = function(codes,isShowCodes){
  // 客户端缓存需要注意，转码存储
  var source_reg = new RegExp("(location\\s*[\\[.])|([.\\[]\s*[\"']?\s*(arguments|dialogArguments|innerHTML" +
  "|open(Dialog)?|showModalDialog|cookie|URL|documentURI|baseURI|referrer|name|opener|parent|top" +
  "|content|self|frames)\\W)|(localStorage|sessionStorage|Database)",'gi');
  // history API会间接影响location的属性
  // (32)['constructor']['constructor']需要留意
  var sink_reg = new RegExp("((src|href|data|location|code|value|action|innerHTML|text|textContent)\\s*[\"'\\]]*\\s*\\+?\\s*=)|" +
    "((replace|assign|navigate|getResponseHeader|open(Dialog)?|showModalDialog|eval|evaluate|execCommand" +
    "|execScript|(new)?\\n+Function\\n*|\\[[\"']constructor[\"']\\]\\[[\"']constructor[\"']\\]" +
    "|history\\.pushState|history\\.replaceState|setTimeout|setInterval|setImmediate|createContextualFragment|write(ln)?)\\s*[\"'\\]]*\\s*\\()",'gi');
  // $.parseHTML有些版本采用div.innerHTML进行转换
  var sink_jQ_reg = new RegExp("after\\(|\\.append\\(|\\.before\\(|\\.html\\(|\\.prepend\\(|\\.replaceWith\\(" +
    "|\\.wrap\\(|\\.wrapAll\\(|\\.globalEval\\(|\\.add\\(|\\.parseHTML\\(",'g');
  var codeDealed = codes.split(/\n\r?/g);
  var codesDek = codes;
  var SourceCounter = 0;
  var SinkCounter = 0;
  var ret = {
    source: [],
    sink: []
  };

  var log = function(msg){
    require('./stdout.js')(msg + '\n');
  };

  /*var esprima = require('./esprima.js');
  var ast = esprima.parse(codes, {
    loc: true,
    comment: false,
    raw: false,
    range: false,
    tolerant: false
  });*/
//  console.time('a');
  codesDek = codesDek.replace(source_reg,function($1){
    SourceCounter ++;
    return '[{bold}][{yellow}]' + $1 + '[{/yellow}][{/bold}]';
  });
  codesDek = codesDek.replace(sink_reg,function($1){
    SinkCounter++;
    return '[{bold}][{red}]' + $1 + '[{/red}][{/bold}]';
  });
  codesDek = codesDek.replace(sink_jQ_reg,function($1){
    SinkCounter++;
    return '[{bold}][{red}]' + $1 + '[{/red}][{/bold}]';
  });
//  console.timeEnd('a');

//  console.time('b');
  codeDealed.forEach(function(c,i){
    c.replace(source_reg,function($1){
      SourceCounter ++;
      ret['source'].push({
        codes: $1,
        lines: i
      });
    });
    c.replace(sink_reg,function($1){
      SinkCounter ++;
      ret['sink'].push({
        codes: $1,
        lines: i
      });
    });
    c.replace(sink_jQ_reg,function($1){
      SinkCounter ++;
      ret['sink'].push({
        codes: $1,
        lines: i
      });
    });
  });
//  console.timeEnd('b');

  // 经过性能测试，发现在循环内正则匹配和直接匹配耗费时间相同


  var printf = function(){
    var sourceRet = ret.source;
    var sinkRet = ret.sink;
    log('');
    log('[{cyan}]XSS漏洞由攻击者利用开发者的漏洞注入外站JS代码，窃取用户数据或者进行CSRF攻击。在XSSMark中，定义XSS Source为攻击者可能的输入源（开发者利用这些被污染的数据源进行DOM操作或者JS执行），' +
      '定义XSS Sink为可能发生XSS漏洞的位置，一般而言在于DOM操作、事件处理和JS执行。利用XSSMark进行标记相应的' +
      '位置，针对可能出现的漏洞做修补－－最安全的方法就是不信任所有的跨域数据源，不信任所有的用户输入数据，进行转码！[{/cyan}]\n');
    log('[{cyan}]XSS Marked:([{yellow}]XSS Source用黄色标记[{/yellow}]，[{red}]XSS Sink用红色标记[{/red}])[{/cyan}]\n');
    log('[{cyan}]XSSMark共发现'+SourceCounter+'个XSS Source，'+ SinkCounter +'个XSS Sink！[{/cyan}]\n');

    if(isShowCodes){
      log(codesDek);
    }

    log('[{cyan}]XSS Source Found:[{/cyan}]\n');
    for(var n=0,len=sourceRet.length;n<len;n++){
      log('[{yellow}]XSSMark Info: XSS Source Marked!\n    Line:[{bold}][{i}]'+ (sourceRet[n]['lines']+1) +'[{/i}][{/bold}]    codes: [{bold}][{i}]'+ sourceRet[n]['codes'] +'[{/i}][{/bold}]  @@@ '+ codeDealed[sourceRet[n]['lines']] +'[{/yellow}]');
    }

    log('[{cyan}]XSS Sink Found:[{/cyan}]\n');
    for(n=0,len=sinkRet.length;n<len;n++){
      if(sinkRet.hasOwnProperty(n)){
        log('[{red}]XSSMark Info: XSS Source Marked!\n    Line:[{bold}][{i}]'+ (sinkRet[n]['lines']+1) +'[{/i}][{/bold}]    codes: [{bold}][{i}]'+ sinkRet[n]['codes'] +'[{/i}][{/bold}]  @@@ '+ codeDealed[sinkRet[n]['lines']] +'[{/red}]');
      }
    }
  };

  printf();
};