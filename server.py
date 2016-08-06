import json
from twisted.internet import reactor
from twisted.web.server import Site
from twisted.web.static import File
from autobahn.twisted.websocket import WebSocketServerFactory
from autobahn.twisted.websocket import WebSocketServerProtocol
from autobahn.twisted.websocket import listenWS


class BallfightServerProtocal(WebSocketServerProtocol):

    def __init__(self):
        WebSocketServerProtocol.__init__(self)
        self.handshakeDone = False
        self.role = None


    def dispatch(self, action, data):
        msg = json.dumps(data).encode('utf8')

        if action == 'toPlayer':
            self.factory.toPlayer(msg)
        elif action == 'toArena':
            self.factory.toArena(msg)
        elif action == 'toHero':
            self.factory.toHero(msg)
        elif action == 'setrole':
            self.role = data
            self.factory.setrole(self, data)


    def onOpen(self):
        self.handshakeDone = True

        
    def onMessage(self, payload, isBinary):
        if isBinary or not self.handshakeDone:
            return

        req = None
        try:
            req = json.loads(payload.decode('utf8'))
        except JSONDecodeError:
            return

        if req and 'action' in req and 'data' in req:
            self.dispatch(req['action'], req['data'])


    def onClose(self, wasClean, code, reason):
        self.factory.unregister(self, self.role)
        WebSocketServerProtocol.onClose(self, wasClean, code, reason)




class BallfightSeverFactory(WebSocketServerFactory):

    def __init__(self, url):
        WebSocketServerFactory.__init__(self, url)
        self.hero = None
        self.monster = None
        self.arena = None
        self.gsensor = None

        self.__show__()


    def __show__(self):
        hS = '\033[92m' if self.hero else '\033[91m'
        mS = '\033[92m' if self.monster else '\033[91m'
        aS = '\033[92m' if self.arena else '\033[91m'
        gS = '\033[92m' if self.gsensor else '\033[91m'
        print('%s hero \033[0m | %s monster \033[0m | %s arena \033[0m | %s gsensor \033[0m ' % (hS, mS, aS, gS), end='\r')


    def toPlayer(self, msg):
        if self.hero:
            self.hero.sendMessage(msg)

        if self.monster:
            self.monster.sendMessage(msg)


    def toArena(self, msg):
        if self.arena:
            self.arena.sendMessage(msg)


    def toHero(self, msg):
        if self.hero:
            self.hero.sendMessage(msg)


    def setrole(self, client, role):
        if role == 'hero':
            self.hero = client
        elif role == 'monster':
            self.monster = client
        elif role == 'arena':
            self.arena = client
        elif role == 'gsensor':
            self.gsensor = client

        self.__show__()


    def unregister(self, client, role):
        if role == 'hero':
            if self.hero == client:
                self.hero = None
        elif role == 'monster':
            if self.monster == client:
                self.monster = None
        elif role == 'arena':
            if self.arena == client:
                self.arena = None
        elif role == 'gsensor':
            if self.gsensor == client:
                self.gsensor = None

        self.__show__()




factory = BallfightSeverFactory("ws://127.0.0.1:8081")
factory.protocol = BallfightServerProtocal
listenWS(factory)

webdir = File("static")
web = Site(webdir)
reactor.listenTCP(8080, web)

reactor.run()