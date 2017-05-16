let express = require('express'),
    app = express();
let fs = require('fs');
let _ = require('underscore');



// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 3-4 linhas de código (você deve usar o módulo de filesystem (fs))
let db = {
  jogadores: JSON.parse(fs.readFileSync(__dirname + '/data/jogadores.json', 'utf8')),

  jogosPorJogador: JSON.parse(fs.readFileSync(__dirname + '/data/jogosPorJogador.json', 'utf8'))
}

console.log(db.jogadores);



// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???');
app.set('view engine', 'hbs');


// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json


app.set('views', 'server/views');
app.get('/', function(request, response) {
  response.render('index', {
    jogadores: db.jogadores.players
  });
});


// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter umas 15 linhas de código

app.get('/jogador/:id_jogador', function(request, response){

  let jogador = _.find(db.jogadores.players, function(el) {
     return el.steamid === request.params.id_jogador;
  });

//dados de jogos do jogador
  let dadosJogador = db.jogosPorJogador[request.params.id_jogador];

  //total de jogos
  jogador.totalJogos = dadosJogador.game_count;

//jogos nao jogados

let total = 0;
  dadosJogador.games.forEach(function(el){
    if (el.playtime_forever == 0){
      total++;
    }
  });

  jogador.not_played = total;

  //ordenar jogos por ordem decrescente
 let orderDecresc =  _.sortBy(dadosJogador.games, function(el) {
    return -el.playtime_forever;
  });

  let favoritos =  _.first(orderDecresc, 5);
  dadosJogador.games = favoritos;

  //passando tempo jogado para horas
  dadosJogador.games = _.map(dadosJogador.games, function(el) {
    el.playtime_forever = Math.round(el.playtime_forever/60);
    return el;
  });

  response.render('jogador', {
    player: jogador,
    descJogos: dadosJogador,
    maisJogado: dadosJogador.games[0]
  });
});


// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static(__dirname + '/../client'));

// abrir servidor na porta 3000
// dica: 1-3 linhas de código
let server = app.listen('3000', function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Listening at http://%s:%s', host, port);
});
