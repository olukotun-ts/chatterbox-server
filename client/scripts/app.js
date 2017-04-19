// Objectives:
// x retrieve messages from server
// x send messages to server
// secure against xss attacks in messages as well as user names and room names etc.
// x allow for chat rooms
// x 'befriend users' functionality by clicking on usernames
  // x bold all messages from those users
// x wrap our methods according to the spec runner expectations

// Extra Objectives
// add new room name to list directly instead of reading it on refresh
// the example and the css we're given mention a spinner loading gif?
// Make everything more dynamic
// General

var app = {

  init: function() {
    app.server = 'http://127.0.0.1:3000/classes/messages';
    app.rooms = {};
    app.$roomName;
    app.messages = [];
    app.username;
    app.friends = [];

    // jQuery selectors
    app.$chatContainer = $('#chats');

    $('form').submit(app.handleSubmit);

    $('#refresh').click(function() {app.fetch();});

    $('select').change(function() {
      app.$roomName = $(this).find(':selected').text();
      if (app.$roomName === 'Add New Room...') {
        app.$roomName = prompt('New room name');
      } else {
        app.fetch(app.$roomName);
      }
    });

    app.$chatContainer.click('.username', app.handleUsernameClick);

  },

  handleUsernameClick: function(event) {
    var userClicked = event.target.text;
    if (userClicked !== undefined) {
      if (app.friends.indexOf(userClicked) === -1) {
        app.friends.push(userClicked);
      }
    }
  },

  handleSubmit: function(event) {
    event.preventDefault();
    if (!app.username) {
      app.username = window.location.search.split('=')[1];
    }
    var data = {};
    data.text = $('#user-message').val();
    data.username = app.username;
    data.roomname = app.$roomName;
    app.send(data);
  },

  send: function(messageObj) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(messageObj),
      contentType: 'application/json',
      success: function(data) {
        console.log('Message successfully sent.');
      },
      error: function(data) {
        console.error('Message failed to post with data: ' + data);
      }
    });
  },

  fetch: function(roomname) {
    var query = {order: '-createdAt'};  // Return msgs in desc order of time.
    if (roomname !== 'Select a Room') {  // If user selects a room, only get msgs from that room.
      query.where = {roomname: roomname};
    }

    $.ajax({
      url: app.server,
      data: query,
      type: 'GET',
      contentType: 'application/json',
      success: function (data) {
        console.log('sucess', data);
        app.messages = data.results;
        app.clearMessages();
        app.renderMessages();
      },
      error: function(data) {
        console.error('getMessage failure with data ' + data);
      }
    });
  },

  renderMessage: function(messageObj) {
      var $messageDiv = $('<div class="chat"></div>');
      var $userName = $('<a class="username"></a>');
      var $messageBody = $('<div class="message-body"></div>');
      var $time = $('<time class="timestamp"></time>');

      $userName.text(messageObj.username);
      $messageBody.text(messageObj.text);
      $time.text(messageObj.createdAt);

      if(app.friends.indexOf(messageObj.username) !== -1) {
        $messageDiv.addClass('friend');
      }

      $messageDiv.append($userName, $messageBody, $time);
      app.$chatContainer.append($messageDiv);

      // populate rooms object
      if(!app.rooms[messageObj.roomname] && messageObj.roomname !== undefined) {
        app.rooms[messageObj.roomname] = messageObj.roomname;
        var $room = $('<option></option>');
        $room.text(messageObj.roomname);
        $('#room-selector select').append($room);
      }
  },

  renderMessages: function() {
    app.messages.forEach(app.renderMessage);
  },

  renderRoom: function(name) {
    var $option = $('<option></option>');
    $option.text(name);
    $('#roomSelect').append($option);
  },

  clearMessages: function() {
    app.$chatContainer.empty();
  }

};
