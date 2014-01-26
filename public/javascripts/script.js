function DataBase() {};

DataBase.prototype.setEmail = function(email){
  localStorage.email = email;
}

DataBase.prototype.getEmail = function(){
  return localStorage.email;
}

function markAsDone(element){
  $(element).children('h4').addClass('done');
  $(element).children('a, input').attr('disabled','disabled');
}

$(function() {
  var socket = io.connect();
  var notifier = new Notifier();
  var db = new DataBase();

  socket.on('ready', function(data){
    $('.input-email').val(data.email);
    db.setEmail(data.email);
    markAsDone('#step2');
  })

  socket.on('error', function(data){
    $('#error').text(data.error);
    $('#error').show();
  })

  socket.on('message', function(data){
    if (!notifier.Notify(data.picture, data.title, data.message)) {
      $("#error").text('Permission denied. Click "Request Permission" to give this domain access to send notifications to your desktop.');
      $("#error").show();
    } else {
      $("#error").hide();
    }    
  });

  /** Verificacoes automaticas **/
  if (!notifier.HasSupport()) {
    $("#error").show();
    return;
  }

  // Verifica se ja tem permissao
  if (notifier.checkPermission()){
    markAsDone('#step1');
  }

  // Pega o email do localstorage e seta no socket.io
  if(db.getEmail()){
    socket.emit('set email', db.getEmail());
  }

  /** Actions **/
  $("#request-permission").click(function() {
    $("#error").hide();
    notifier.RequestPermission(function(){
      if(notifier.checkPermission()){
        markAsDone('#step1');    
      }
    });    
  });  

  $('.setemail').click(function(){
    socket.emit('set email', $('.input-email').val());
  })  

  $("#notify-me").click(function() {
    socket.emit('communicate');
  });

});