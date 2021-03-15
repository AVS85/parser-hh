// *** метод ...
var request = require('request'); //не поддерживает win-1251
var needle = require('needle');

// *** модули для ...
var tress = require('tress');
var cheerio = require('cheerio');
var resolve = require('url').resolve;
var fs = require('fs');

var URL = 'https://hh.ru/search/vacancy?clusters=true&enable_snippets=true&salary=&st=searchVacancy&text=nuxt';
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
        var nextPage = $('.bloko-link.HH-LinkModifier.HH-VacancyActivityAnalytics-Vacancy')
        console.log(nextPage.length)

        //* если ссылки для переходов найдены ->
        if ( nextPage.length > 0 ) {
            nextPage.each(function(i, item) {
                // console.log('**********', item )
                link_crawler.push( item.children[0].data )
                // link_crawler.push( { href: item.attribs.href, title: item.children[0].data, } )
                q.push(resolve(URL, $(this).attr('href')))  // приводим относительный адрес ссылки к абсолютному
            });
            (function(){
                require('fs').writeFileSync('./link_crawler.json', JSON.stringify(link_crawler, null, 4));
            })()
        }

        //* пагинация
        // var next_pagg = $('.bloko-gap > .bloko-button')
        // console.log('next_pagg ', next_pagg.length)

        //*  
        // if ( next_pagg.length > 0 ) {
        //     nextPage.each(function(i, item) {
        //         // console.log('**********', item )
        //         link_crawler.push( item.children[0].data )
        //         // link_crawler.push( { href: item.attribs.href, title: item.children[0].data, } )
        //         q.push(resolve(URL, $(this).attr('href')))  // приводим относительный адрес ссылки к абсолютному
        //     });
        //     (function(){
        //         require('fs').writeFileSync('./link_crawler.json', JSON.stringify(link_crawler, null, 4));
        //     })()
        // }







        //* ищем ключевые навыки
        var skills = $('.bloko-tag__section')
        if ( skills.length > 0 ) {

            //* если мы на странице резюме - записываем заголовок
            $('.vacancy-title').text()
            skills.each(function(i, item) {
                // console.log('**********', item )
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