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
  
  socket.on('news', function (data) {
    console.log(data);
  });  

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

  if (notifier.checkPermission()){
    markAsDone('#step1');
  }

  if(db.getEmail()){
    $('.input-email').val(db.getEmail());
    markAsDone('#step2');
  }


  /** Actions **/

  $("#request-permission").click(function() {
    $("#error").hide();
    notifier.RequestPermission();
    markAsDone('#step1');
  });  

  $('.setemail').click(function(){
    db.setEmail($('.input-email').val());
    markAsDone('#step2');
  })  

  $("#notify-me").click(function() {
    socket.emit('setemail', { email: db.getEmail() } );
  });




});