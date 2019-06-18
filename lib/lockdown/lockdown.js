const LOCKDOWN_PORT = 62078;
const LABEL = 'usbmuxd';
const PROTOCOL_VERSION = 2;

class Lockdown {

  constructor (plistService) {
    this.plistService = plistService;
  }

  async queryType () {
    const data = await this.plistService.sendPlistAndReceive({
      Label: LABEL,
      ProtocolVersion: PROTOCOL_VERSION,
      Request: 'QueryType'
    });
    if (data.Request === 'QueryType' && data.Type === 'com.apple.mobile.lockdown') {
      return data;
    } else {
      throw new Error(data);
    }
  }

  async startSession (hostID, systemBUID, hostPrivateKey, hostCertificate) {
    this._hostPrivateKey = hostPrivateKey;
    this._hostCertificate = hostCertificate;

    const data = await this.plistService.sendPlistAndReceive({
      Label: LABEL,
      ProtocolVersion: PROTOCOL_VERSION,
      Request: 'StartSession',
      HostID: hostID,
      SystemBUID: systemBUID
    });

    if (data.Request === 'StartSession' && data.SessionID) {
      return { sessionID: data.SessionID, enableSessionSSL: data.EnableSessionSSL };
    } else {
      throw new Error(data);
    }
  }

  enableSessionSSL () {
    this.plistService.enableSessionSSL(this._hostPrivateKey, this._hostCertificate);
  }

  async getValue (query = {}) {
    let plist = {
      Label: LABEL,
      ProtocolVersion: PROTOCOL_VERSION,
      Request: 'GetValue'
    };
    Object.assign(plist, query);
    const data = await this.plistService.sendPlistAndReceive(plist);
    if (data.Request === 'GetValue' && data.Value) {
      return data.Value;
    } else {
      throw new Error(data);
    }
  }

  async startService (serviceName) {
    const data = await this.plistService.sendPlistAndReceive({
      Label: LABEL,
      ProtocolVersion: PROTOCOL_VERSION,
      Request: 'StartService',
      Service: serviceName,
    });

    if (data.Error) {
      throw new Error(data);
    } else {
      return data;
    }
  }

  close () {
    this.plistService.close();
  }
}

export { Lockdown, LOCKDOWN_PORT };
export default Lockdown;