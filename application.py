import os

from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

#Global variables
channels = []
userchannels = {}
channelmessages = {}
activechannel = ["temp"]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/home", methods=["POST", "GET"])
def home():
    return render_template("home.html")

#NewChannel route
@app.route("/newchannel", methods=["POST"])
def newchannel():
    channelname = request.form.get("channelname")
    username = request.form.get("username")
    for channel in channels:
        if channelname == channel:
            return jsonify({"success" : False})
    channels.append(channelname)

    if username in userchannels:
        userchannels[username].append(channelname)
    else:
        userchannels[username] = []
        userchannels[username].append(channelname)

    return jsonify({"success" : True})

#MyChannels route
@app.route("/mychannels", methods=["POST"])
def mychannels():
    username = request.form.get("username")
    if username in userchannels:
        if len(userchannels[username]) > 0:
            return jsonify({"success" : True, "mychannels" : userchannels[username], "allchannels" : channels})
    return jsonify({"success" : True, "mychannels" : [], "allchannels" : channels})

@socketio.on("submit message")
def newmessage(data):
    message = data["message"]
    username = data["username"]
    messageinfo = {"username" : username, "message" : message}
    channelmessages[activechannel[0]].append(messageinfo)
    emit("channel messages", {"message" : message}, broadcast = True)


@app.route("/getchannelmessages", methods=["POST"])
def getchannelmessages():
    channelname = request.form.get("channelname")
    activechannel[0] = channelname
    if activechannel[0] not in channelmessages:
        channelmessages[activechannel[0]] = []
        return jsonify({"success" : False})
    return jsonify({"success" : True, "channelmessages" : channelmessages[activechannel[0]]})

@app.route("/addtomychannels", methods=["POST"])
def addtomychannels():
    channelname = request.form.get("channelname")
    username = request.form.get("username")
    if username not in userchannels:
        userchannels[username] = []
    addchannel = True
    for channel in userchannels[username]:
        if channel == channelname:
            addchannel = False
    if addchannel:
        userchannels[username].append(channelname)
        return jsonify({"success" : True, "channelname" : channelname})
    else:
        return jsonify({"success" : False})
