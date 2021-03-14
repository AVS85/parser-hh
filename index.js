// *** метод ...
var request = require('request'); //не поддерживает win-1251
var needle = require('needle');

// *** модули для ...
var tress = require('tress');
var cheerio = require('cheerio');
var resolve = require('url').resolve;
var fs = require('fs');

var URL = 'https://hh.ru/search/resume?clusters=True&area=1&ored_clusters=True&order_by=relevance&logic=normal&pos=full_text&exp_period=all_time&st=resumeSearch&text=nuxtjs';
var results = [];
var res_skills = [];
var link_crawler = [];

console.log(`*********************************************`)

var q = tress(function(url, callback){
    // `tress` последовательно вызывает обработчик для каждой ссылки в очереди

    //* по url получаем DOM страницы
    needle.get(url, function(err, res){
        if (err) throw err;

        var $ = cheerio.load(res.body)

        //* находим в res.body ссылки на вложенные страницы -> пушим их в очередь q
        var nextPage = $('a.resume-search-item__name')
        
        //* если ссылки для переходов найдены ->
        if ( nextPage.length > 0 ) {
            nextPage.each(function(i, item) {
                console.log('**********', item )
                link_crawler.push( item.children[0].data )
                // link_crawler.push( { href: item.attribs.href, title: item.children[0].data, } )
                q.push(resolve(URL, $(this).attr('href')))  // приводим относительный адрес ссылки к абсолютному
            });
            (function(){
                require('fs').writeFileSync('./link_crawler.json', JSON.stringify(link_crawler, null, 4));
            })()
        }

        //* ищем ключевые навыки
        var skills = $('.bloko-tag__section')
        if ( skills.length > 0 ) {
            skills.each(function(i, item) {
                console.log('**********', item )
                res_skills.push( item.children[0].data )
                // q.push(resolve(URL, $(this).attr('href')))  // приводим относительный адрес ссылки к абсолютному
            });
            (function(){
                require('fs').writeFileSync('./skills.json', JSON.stringify(res_skills, null, 4));
            })()
        }





        callback()
    });

}, 1); // запускаем N параллельных потоков

// эта функция выполнится, когда в очереди закончатся ссылки
q.drain = function(){
    require('fs').writeFileSync('./data.json', JSON.stringify(res_skills, null, 4));
}

// добавляем в очередь ссылку на первую страницу списка
q.push(URL)