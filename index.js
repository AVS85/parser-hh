const converter = require('json-2-csv');

// *** метод ...
var request = require('request'); //не поддерживает win-1251
var needle = require('needle');

// *** модули для ...
var tress = require('tress');
var cheerio = require('cheerio');
var resolve = require('url').resolve;
var fs = require('fs');
var uniq_links = []; // добавляем линки для проверки их уникальности
var cntTagetPages = 0
var countUniqLinks = 0
// var URL = `https://hh.ru/search/vacancy?clusters=true&enable_snippets=true&text=${search_text}&page=0`;

let search_text = 'Менеджер ресторана'

var URL = `https://hh.ru/search/vacancy?clusters=true&enable_snippets=true&text=${encodeURIComponent(search_text)}&L_save_area=true&area=1&showClusters=true&page=0`;

console.log(URL);

var results = [];
var res_skills = [];
var link_crawler = [];

console.log(`*********************************************`)

var q = tress(function(url, callback){
    // `tress` последовательно вызывает задания в очереди

    // по url получаем DOM страницы
    needle.get(url, function(err, res){
        if (err) throw err;

        var $ = cheerio.load(res.body)

        // находим в res.body ссылки на внутренние страницы -> пушим их в очередь q
        var targetPages = $('.vacancy-serp-wrapper .g-user-content a.bloko-link')
        // console.log('targetPages', targetPages?.length)

        // если ссылки внутренние страницы найдены ->
        if ( targetPages.length > 0 ) {
            console.log('ссылок на внутр страницы: ', targetPages.length)
            targetPages.each(function(i, item) {
                console.log('**********', item.attribs.href )
                // link_crawler.push( item.children[0].data )
                // link_crawler.push( { href: item.attribs.href, title: item.children[0].data, } )
                q.push(resolve(URL, $(this).attr('href')))  // приводим относительный адрес ссылки к абсолютному
            });
            
            // (function(){
            //     require('fs').writeFileSync('./link_crawler.json', JSON.stringify(link_crawler, null, 4));
            // })()
        }

        //* пагинация
        var next_pagg = $('.bloko-button-group  a')
        next_pagg.each( (i, item) => {
            let href = item.attribs.href

            let uniq_bool = uniq_links.some( link => { return  link == href })

            if (!uniq_bool) {
                // если ссылка уникальна -> добавляем в массив + ставим в очередь на обход
                uniq_links.push(href)
                q.push(resolve(URL, href))
                console.log('count UniqLinks ', countUniqLinks++, href);
            }
        })
        // console.log('next_pagg ', next_pagg.length)



        //* ищем ключевые навыки -> мы на странице резюме
        var el_skills = $('.bloko-tag__section')
        if ( el_skills.length > 0 ) {

            // заголовок
            // let title = $('.vacancy-title > h1').text().replace(/[\,]/g, '')
            // let skills = []

            // навыки
            el_skills.each(function(i, item) {
                // skills.push( item.children[0].data )
                res_skills.push(item.children[0].data);
            });

            // res_skills.push({ title, skills: [...skills] });

            (function(){
                require('fs').writeFileSync('./skills.json', JSON.stringify(res_skills, null, 1));
            })()
        }





        callback()
    });

}, 12); // запускаем N параллельных потоков



// // Drain выполнится после выполнения последнего задания в очереди
q.drain = function(){
    require('fs').writeFileSync(`./result/${search_text}.json`, JSON.stringify(res_skills, null, 4));
    // converter.json2csv(res_skills, (err, csv) => {
    //     if (err) {
    //         console.log('err converter');
    //         throw err;
    //     }
            
    //     fs.writeFileSync('todos.csv', csv); // write CSV to a file
    //     }, options = { 
    //         excelBOM: true 
    //     }
    // );
};

// добавляем в очередь ссылку на первую страницу списка
q.push(URL)