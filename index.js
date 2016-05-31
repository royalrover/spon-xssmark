/**
 * Created by showjoy on 16/5/31.
 */
var path = require('path');
var fs = require('fs');
module.exports = function(spon){
  var log = function(msg){
    require('./stdout.js')(msg);
  };
  var mark = require('./mark.js');
  spon.cli
    .command('xssmark [cmd]')
    .option("-s, --show [type]", "是否在命令行显示标记的代码")
    .description('xss标记')
    .action(function(cmd,op){
      if(typeof cmd == 'string'){
        fs.readFile(path.join(process.cwd(),'src/pages/',cmd,cmd + '.js'),'utf8',function(err,data){
          if(err){
            log('[{red}]error: XSS Plugin发生错误，无法读取指定js代码[{/red}]')
          }
          var isShowCodes = op.show ? true : false;
          mark(data,isShowCodes);
        });
      }

    });
};