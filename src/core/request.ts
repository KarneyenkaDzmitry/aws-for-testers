import axios, { AxiosInstance, AxiosRequestConfig, AxiosStatic, Method } from "axios";
import { Response } from "./response";
import { ParsedUrlQueryInput, stringify } from "querystring";
import { AxiosBasicCredentials } from "axios/index";

const client: AxiosInstance = axios.create({
    validateStatus(): boolean {
        return true;
    },
});

export class Request {
    private options: AxiosRequestConfig = {};

    constructor(private readonly _base_url: string) {
        this.options.baseURL = _base_url;
    }

    public body(data: any): Request {
        this.options.data = data;
        return this;
    }

    public method(name: Method): Request {
        this.options.method = name;
        return this;
    }

    public appendPath(path: string | number): Request {
        this.options.baseURL += `/${path}`;
        return this;
    }

    public query(queries?: ParsedUrlQueryInput): Request {
        this.options.baseURL += `?${stringify(queries)}`;
        return this;
    }

    public headers(headers: AxiosRequestConfig["headers"]): Request {
        this.options.headers = { ...this.options.headers, ...(headers as any) };
        return this;
    }

    public auth(auth?: AxiosBasicCredentials): Request {
        this.options.auth = auth || { username: "", password: "" };
        return this;
    }

    public async send(): Promise<Response> {
        return new Response(await client(this.options));
    }
}
