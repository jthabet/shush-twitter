export interface Keyword {
  keyword?: string;
  id?: string;
  valid_from?: null;
  valid_until?: null;
  created_at?: string;
  mute_surfaces?: string[];
  mute_options?: string[];
}

// Converts JSON strings to/from your types
export class Convert {
  public static toKeywords(json: string): Keyword[] {
    return JSON.parse(json);
  }

  public static keywordsToJson(value: Keyword[]): string {
    return JSON.stringify(value);
  }
}
