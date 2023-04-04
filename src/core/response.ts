import { AxiosRequestConfig, AxiosResponse } from "axios";

export class Response {
    constructor(private readonly response: AxiosResponse) {}

    public body(): any {
        return this.response.data;
    }

    public headers(): AxiosResponse["headers"] {
        return this.response.headers;
    }

    public status(): AxiosResponse["status"] {
        return this.response.status;
    }

    public statusText(): AxiosResponse["statusText"] {
        return this.response.statusText;
    }

    public params(): AxiosRequestConfig["params"] {
        return this.response.config.params;
    }
}
