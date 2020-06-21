document.addEventListener('DOMContentLoaded', () => {

    document.querySelector("#type-message").hidden = true;

    document.querySelector('#new-channel-btn').onclick = () => {
      //Get the channel name
      const channelname = document.querySelector('#new-channel-name').value;

      document.querySelector('#new-channel-name').value = '';

      // Initialize new request
      const request = new XMLHttpRequest();
      request.open('POST', '/newchannel');

      //Callback function
      request.onload = ()=>{

        const data = JSON.parse(request.responseText);
        if(data.success)
        {
          //Create a new item for channel list
          const li = document.createElement('li');
          li.innerHTML = channelname;
          li.style.padding = "5px";

          //Add the new channel to the channel list
          document.querySelector('#channels').append(li);

        }

      };

      // Add data to send with request
      const data = new FormData();
      data.append('channelname', channelname);
      data.append('username', localStorage.getItem('users'));

      // Send request
      request.send(data);
      return false;

    };

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure button
    socket.on('connect', () => {
      document.querySelector('#new-msg-btn').onclick = () => {
          const message = document.querySelector('#new-msg-text').value;
          document.querySelector('#new-msg-text').value = '';
          socket.emit('submit message', {'message' : message, 'username' : localStorage.getItem('users')});
      };
    });

    socket.on('channel messages', data => {
      const div = document.createElement('div');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      li1.innerHTML = localStorage.getItem('users');
      div.append(li1);
      li1.classList.add('msgusername');
      li2.innerHTML = data.message;
      div.append(li2);
      li2.classList.add('actualmsg');
      document.querySelector('#channel-msgs').append(div);
      div.classList.add('my-channel-msgs-div');
   });

    const request = new XMLHttpRequest();
    request.open('POST', '/mychannels');
    request.onload = ()=>{
      const data = JSON.parse(request.responseText);
      if(data.success)
      {
        for(var mychannel of data.mychannels)
        {
          //Create a new item for channel list
          const li = document.createElement('li');
          li.innerHTML = mychannel;
          li.style.padding = "5px";
          li.classList.add('mychannel')
          //Add the new channel to the channel list
          document.querySelector('#channels').append(li);

          //Add callback on click of li
          li.addEventListener('click', function() {
              document.querySelector("#type-message").hidden = false;
              const request = new XMLHttpRequest();
              request.open('POST', '/getchannelmessages');
              request.onload = () => {
                const data = JSON.parse(request.responseText);
                if(data.success)
                {
                  document.querySelector('#channel-msgs').innerHTML = "";
                  for(var messageinfo of data.channelmessages)
                  {
                      if(messageinfo)
                      {
                        const div = document.createElement('div');
                        const li1 = document.createElement('li');
                        const li2 = document.createElement('li');
                        li1.innerHTML = messageinfo.username;
                        div.append(li1);
                        li1.classList.add('msgusername');
                        li2.innerHTML = messageinfo.message;
                        div.append(li2);
                        li2.classList.add('actualmsg');
                        document.querySelector('#channel-msgs').append(div);
                        if(messageinfo.username === localStorage.getItem('users'))
                          div.classList.add('my-channel-msgs-div');
                        else
                          div.classList.add('channel-msgs-div');
                      }
                  }
                }
              };
              // Add data to send with request
              const data = new FormData();
              const channelname = this.innerHTML;
              data.append('channelname', channelname);

              // Send request
              request.send(data);
              return true;
          });

        }

        for(var allchannel of data.allchannels)
        {
          //Create a new item for channel list
          const li = document.createElement('li');
          li.innerHTML = allchannel;
          li.style.padding = "5px";
          li.classList.add('mychannel')
          //Add the new channel to the all channel list
          document.querySelector('#allchannels').append(li);

          //Add callback on click of li
          li.addEventListener('click', function() {

              const request = new XMLHttpRequest();
              request.open('POST', '/addtomychannels');
              request.onload = () => {
                const data = JSON.parse(request.responseText);
                if(data.success)
                {
                    alert(`added channel ${data.channelname}`);
                }
              };
              // Add data to send with request
              const data = new FormData();
              const channelname = this.innerHTML;
              data.append('channelname', channelname);
              data.append('username', localStorage.getItem('users'));
              // Send request
              request.send(data);
              return true;

          });
        }
      }
    };
    // Add data to send with request
    const data = new FormData();
    data.append('username', localStorage.getItem('users'));

    // Send request
    request.send(data);
    return true;
});
