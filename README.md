# What is VidSync?
VidSync is a project that aims to synchronize video playblack, like Netflix party, with your friends on any video you watch, anywhere on the web!\
As of now VidSync is available as a Firefox add-on.

# How does it work?
VidSync uses a websocket server to synchronize the participant sockets (Created by the add-on) via messages. Participants can inform each other if they are paused (Either due to user action or buffering), played or seeked, so that they remain synchronized. The VidSync server sends auto-sync messages at specified intervals to ensure synchronization.\
\
The add-on listens to the server via a socket and uses content scripts to interact with the video tag in the DOM.

# Installation
Download the latest release of VidSync add-on from the release tab (.xpi file only required).\
Head over to the add-on page in firefox and click the :gear: icon to 'Install add-on From file...' and select the downloaded .xpi VidSync add-on file.

# Usage
VidSync can be started by clicking the icon on the browser toolbar. 

# Points to Remember
- VidSync is an add-on. Hence by its very nature it cannot access video tags embeded via an i-frame (Cross origin restrictions). Using it on such a site will result in a error message being displayed.
- As of now, VidSync is hosted on a free Heroku instance and supports only one room. Hence if your video doesn't match what the room is watching, you can't join.