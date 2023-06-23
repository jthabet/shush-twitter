export interface NetworkRequest {
  documentID?: string;
  documentLifecycle?: string;
  frameID?: number;
  frameType?: string;
  initiator?: string;
  method?: string;
  parentFrameID?: number;
  requestHeaders?: RequestHeader[];
  requestID?: string;
  tabID?: number;
  timeStamp?: number;
  type?: string;
  url?: string;
}

export interface RequestHeader {
  name?: string;
  value?: string;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toNetworkRequest(json: string): NetworkRequest {
    return JSON.parse(json);
  }

  public static networkRequestToJson(value: NetworkRequest): string {
    return JSON.stringify(value);
  }
}
