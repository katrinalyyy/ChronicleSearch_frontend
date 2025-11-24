/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum Lab1IntermalAppRoleRole {
  /** 0 - Исследователь (обычный пользователь) */
  Researcher = 0,
  /** 1 - Модератор (администратор) */
  Moderator = 1,
}

export enum Lab1IntermalAppDsRequestStatus {
  RequestStatusDraft = "черновик",
  RequestStatusDeleted = "удалён",
  RequestStatusFormed = "сформирован",
  RequestStatusCompleted = "завершён",
  RequestStatusRejected = "отклонён",
}

export interface Lab1IntermalAppDsChronicleResource {
  author?: string;
  date_of_creation?: string;
  detailed_description?: string;
  detailed_editions?: string;
  detailed_significance?: string;
  id?: number;
  image?: string;
  location?: string;
  time_of_action?: string;
  title?: string;
}

export interface Lab1IntermalAppDsRequestChronicleResearch {
  completed_at?: SqlNullTime;
  created_at?: string;
  creator?: Lab1IntermalAppDsUser;
  formed_at?: SqlNullTime;
  id?: number;
  moderator?: Lab1IntermalAppDsUser;
  name?: string;
  search_event?: string;
  status?: Lab1IntermalAppDsRequestStatus;
}

export interface Lab1IntermalAppDsUser {
  name?: string;
  pass?: string;
  role?: Lab1IntermalAppRoleRole;
  uuid?: string;
}

export interface IntermalAppHandlerLoginReq {
  /** @example "max" */
  login?: string;
  /** @example "123" */
  password?: string;
}

export interface IntermalAppHandlerLoginResp {
  /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
  access_token?: string;
  /** @example 3600000000000 */
  expires_in?: number;
  /** @example "Bearer" */
  token_type?: string;
}

export interface IntermalAppHandlerRegisterReq {
  /** @example "testuser" */
  name?: string;
  /** @example "password123" */
  pass?: string;
}

export interface IntermalAppHandlerRegisterResp {
  /** @example true */
  ok?: boolean;
}

export interface SqlNullTime {
  time?: string;
  /** Valid is true if Time is not NULL */
  valid?: boolean;
}

export namespace Api {
  /**
   * @description Получить список заявок (для пользователя - только свои, для модератора - все)
   * @tags ChronicleRequestList
   * @name ChronicleRequestListList
   * @summary Получить список заявок
   * @request GET:/api/ChronicleRequestList
   * @secure
   */
  export namespace ChronicleRequestListList {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Фильтр по статусу */
      status?: string;
      /** Дата начала (YYYY-MM-DD) */
      start_date?: string;
      /** Дата окончания (YYYY-MM-DD) */
      end_date?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Получить ID черновика заявки и количество хроник в нем (для неавторизованных возвращает пустую корзину)
   * @tags ChronicleRequestList
   * @name ChronicleRequestListChronicleDraftList
   * @summary Получить информацию о черновике заявки
   * @request GET:/api/ChronicleRequestList/chronicle_draft
   */
  export namespace ChronicleRequestListChronicleDraftList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Получить детальную информацию о заявке со списком хроник (требуется авторизация)
   * @tags ChronicleRequestList
   * @name ChronicleRequestListDetail
   * @summary Получить заявку с хрониками
   * @request GET:/api/ChronicleRequestList/{id_chronicle_request}
   * @secure
   */
  export namespace ChronicleRequestListDetail {
    export type RequestParams = {
      /** ID заявки */
      idChronicleRequest: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Обновление полей заявки (требуется авторизация)
   * @tags ChronicleRequestList
   * @name ChronicleRequestListUpdate
   * @summary Обновить заявку
   * @request PUT:/api/ChronicleRequestList/{id_chronicle_request}
   * @secure
   */
  export namespace ChronicleRequestListUpdate {
    export type RequestParams = {
      /** ID заявки */
      idChronicleRequest: number;
    };
    export type RequestQuery = {};
    export type RequestBody = Lab1IntermalAppDsRequestChronicleResearch;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Удаление заявки (требуется авторизация, только создатель)
   * @tags ChronicleRequestList
   * @name ChronicleRequestListDelete
   * @summary Удалить заявку
   * @request DELETE:/api/ChronicleRequestList/{id_chronicle_request}
   * @secure
   */
  export namespace ChronicleRequestListDelete {
    export type RequestParams = {
      /** ID заявки */
      idChronicleRequest: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Завершение или отклонение заявки (только для модератора)
   * @tags ChronicleRequestList
   * @name ChronicleRequestListChronicleCompleteOrRejectUpdate
   * @summary Завершить или отклонить заявку
   * @request PUT:/api/ChronicleRequestList/{id_chronicle_request}/chronicle_complete-or-reject
   * @secure
   */
  export namespace ChronicleRequestListChronicleCompleteOrRejectUpdate {
    export type RequestParams = {
      /** ID заявки */
      idChronicleRequest: number;
    };
    export type RequestQuery = {};
    export type RequestBody = {
      action?: string;
    };
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Формирование заявки из черновика (требуется авторизация, только создатель)
   * @tags ChronicleRequestList
   * @name ChronicleRequestListChronicleRequestFormUpdate
   * @summary Сформировать заявку
   * @request PUT:/api/ChronicleRequestList/{id_chronicle_request}/chronicle_request-form
   * @secure
   */
  export namespace ChronicleRequestListChronicleRequestFormUpdate {
    export type RequestParams = {
      /** ID заявки */
      idChronicleRequest: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Обновление количества, порядка или других полей связи хроники с заявкой (требуется авторизация)
   * @tags chronicle_research
   * @name ChronicleResearchChroniclesUpdate
   * @summary Обновить хронику в заявке
   * @request PUT:/api/chronicle_research/{id}/chronicles/{chronicle_id}
   * @secure
   */
  export namespace ChronicleResearchChroniclesUpdate {
    export type RequestParams = {
      /** ID заявки */
      id: number;
      /** ID хроники */
      chronicleId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = object;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Удаление хроники из заявки (требуется авторизация)
   * @tags chronicle_research
   * @name ChronicleResearchChroniclesDelete
   * @summary Удалить хронику из заявки
   * @request DELETE:/api/chronicle_research/{id}/chronicles/{chronicle_id}
   * @secure
   */
  export namespace ChronicleResearchChroniclesDelete {
    export type RequestParams = {
      /** ID заявки */
      id: number;
      /** ID хроники */
      chronicleId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Получить список всех хроник с возможностью фильтрации по названию, автору и локации
   * @tags chronicle_resources
   * @name ChronicleResourcesList
   * @summary Получить список хроник
   * @request GET:/api/chronicle_resources
   */
  export namespace ChronicleResourcesList {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Фильтр по названию */
      title?: string;
      /** Фильтр по автору */
      author?: string;
      /** Фильтр по локации */
      location?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Создание новой хроники (требуется авторизация)
   * @tags chronicle_resources
   * @name ChronicleResourcesCreate
   * @summary Создать хронику
   * @request POST:/api/chronicle_resources
   * @secure
   */
  export namespace ChronicleResourcesCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = Lab1IntermalAppDsChronicleResource;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Получить детальную информацию о хронике по идентификатору
   * @tags chronicle_resources
   * @name ChronicleResourcesDetail
   * @summary Получить хронику по ID
   * @request GET:/api/chronicle_resources/{id_chronicle_resource}
   */
  export namespace ChronicleResourcesDetail {
    export type RequestParams = {
      /** ID хроники */
      idChronicleResource: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Обновление существующей хроники (требуется авторизация)
   * @tags chronicle_resources
   * @name ChronicleResourcesUpdate
   * @summary Обновить хронику
   * @request PUT:/api/chronicle_resources/{id_chronicle_resource}
   * @secure
   */
  export namespace ChronicleResourcesUpdate {
    export type RequestParams = {
      /** ID хроники */
      idChronicleResource: number;
    };
    export type RequestQuery = {};
    export type RequestBody = Lab1IntermalAppDsChronicleResource;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Удаление хроники по ID (требуется авторизация)
   * @tags chronicle_resources
   * @name ChronicleResourcesDelete
   * @summary Удалить хронику
   * @request DELETE:/api/chronicle_resources/{id_chronicle_resource}
   * @secure
   */
  export namespace ChronicleResourcesDelete {
    export type RequestParams = {
      /** ID хроники */
      idChronicleResource: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Добавление хроники в черновик заявки (требуется авторизация)
   * @tags chronicle_resources
   * @name ChronicleResourcesAddToChronicleRequestCreate
   * @summary Добавить хронику в заявку
   * @request POST:/api/chronicle_resources/{id_chronicle_resource}/add_to_chronicle_request
   * @secure
   */
  export namespace ChronicleResourcesAddToChronicleRequestCreate {
    export type RequestParams = {
      /** ID хроники */
      idChronicleResource: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Загрузка изображения для хроники (требуется авторизация)
   * @tags chronicle_resources
   * @name ChronicleResourcesImageCreate
   * @summary Загрузить изображение хроники
   * @request POST:/api/chronicle_resources/{id_chronicle_resource}/image
   * @secure
   */
  export namespace ChronicleResourcesImageCreate {
    export type RequestParams = {
      /** ID хроники */
      idChronicleResource: number;
    };
    export type RequestQuery = {};
    export type RequestBody = {
      /** Изображение */
      image: File;
    };
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Получение данных профиля текущего авторизованного пользователя
   * @tags user
   * @name UserProfileList
   * @summary Получить профиль пользователя
   * @request GET:/api/user/profile
   * @secure
   */
  export namespace UserProfileList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }

  /**
   * @description Обновление данных профиля текущего авторизованного пользователя (имя, пароль)
   * @tags user
   * @name UserProfileUpdate
   * @summary Обновить профиль пользователя
   * @request PUT:/api/user/profile
   * @secure
   */
  export namespace UserProfileUpdate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = {
      name?: string;
      password?: string;
    };
    export type RequestHeaders = {};
    export type ResponseBody = Record<string, any>;
  }
}

export namespace Login {
  /**
   * @description Аутентификация пользователя и получение JWT токена
   * @tags auth
   * @name LoginCreate
   * @summary Вход пользователя
   * @request POST:/login
   */
  export namespace LoginCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = IntermalAppHandlerLoginReq;
    export type RequestHeaders = {};
    export type ResponseBody = IntermalAppHandlerLoginResp;
  }
}

export namespace Logout {
  /**
   * @description Добавление JWT токена в блеклист (logout)
   * @tags auth
   * @name LogoutCreate
   * @summary Выход пользователя
   * @request POST:/logout
   * @secure
   */
  export namespace LogoutCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}

export namespace SignUp {
  /**
   * @description Создание нового пользователя с ролью Исследователь
   * @tags auth
   * @name SignUpCreate
   * @summary Регистрация нового пользователя
   * @request POST:/sign_up
   */
  export namespace SignUpCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = IntermalAppHandlerRegisterReq;
    export type RequestHeaders = {};
    export type ResponseBody = IntermalAppHandlerRegisterResp;
  }
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title ChronicleSearch API
 * @version 1.0
 * @license MIT (https://opensource.org/licenses/MIT)
 * @contact API Support <support@chroniclesearch.ru>
 *
 * REST API для системы поиска и управления историческими хрониками
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Получить список заявок (для пользователя - только свои, для модератора - все)
     *
     * @tags ChronicleRequestList
     * @name ChronicleRequestListList
     * @summary Получить список заявок
     * @request GET:/api/ChronicleRequestList
     * @secure
     */
    chronicleRequestListList: (
      query?: {
        /** Фильтр по статусу */
        status?: string;
        /** Дата начала (YYYY-MM-DD) */
        start_date?: string;
        /** Дата окончания (YYYY-MM-DD) */
        end_date?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/ChronicleRequestList`,
        method: "GET",
        query: query,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получить ID черновика заявки и количество хроник в нем (для неавторизованных возвращает пустую корзину)
     *
     * @tags ChronicleRequestList
     * @name ChronicleRequestListChronicleDraftList
     * @summary Получить информацию о черновике заявки
     * @request GET:/api/ChronicleRequestList/chronicle_draft
     */
    chronicleRequestListChronicleDraftList: (params: RequestParams = {}) =>
      this.request<Record<string, any>, any>({
        path: `/api/ChronicleRequestList/chronicle_draft`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получить детальную информацию о заявке со списком хроник (требуется авторизация)
     *
     * @tags ChronicleRequestList
     * @name ChronicleRequestListDetail
     * @summary Получить заявку с хрониками
     * @request GET:/api/ChronicleRequestList/{id_chronicle_request}
     * @secure
     */
    chronicleRequestListDetail: (
      idChronicleRequest: number,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/ChronicleRequestList/${idChronicleRequest}`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновление полей заявки (требуется авторизация)
     *
     * @tags ChronicleRequestList
     * @name ChronicleRequestListUpdate
     * @summary Обновить заявку
     * @request PUT:/api/ChronicleRequestList/{id_chronicle_request}
     * @secure
     */
    chronicleRequestListUpdate: (
      idChronicleRequest: number,
      request: Lab1IntermalAppDsRequestChronicleResearch,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/ChronicleRequestList/${idChronicleRequest}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаление заявки (требуется авторизация, только создатель)
     *
     * @tags ChronicleRequestList
     * @name ChronicleRequestListDelete
     * @summary Удалить заявку
     * @request DELETE:/api/ChronicleRequestList/{id_chronicle_request}
     * @secure
     */
    chronicleRequestListDelete: (
      idChronicleRequest: number,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/ChronicleRequestList/${idChronicleRequest}`,
        method: "DELETE",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Завершение или отклонение заявки (только для модератора)
     *
     * @tags ChronicleRequestList
     * @name ChronicleRequestListChronicleCompleteOrRejectUpdate
     * @summary Завершить или отклонить заявку
     * @request PUT:/api/ChronicleRequestList/{id_chronicle_request}/chronicle_complete-or-reject
     * @secure
     */
    chronicleRequestListChronicleCompleteOrRejectUpdate: (
      idChronicleRequest: number,
      action: {
        action?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/ChronicleRequestList/${idChronicleRequest}/chronicle_complete-or-reject`,
        method: "PUT",
        body: action,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Формирование заявки из черновика (требуется авторизация, только создатель)
     *
     * @tags ChronicleRequestList
     * @name ChronicleRequestListChronicleRequestFormUpdate
     * @summary Сформировать заявку
     * @request PUT:/api/ChronicleRequestList/{id_chronicle_request}/chronicle_request-form
     * @secure
     */
    chronicleRequestListChronicleRequestFormUpdate: (
      idChronicleRequest: number,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/ChronicleRequestList/${idChronicleRequest}/chronicle_request-form`,
        method: "PUT",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновление количества, порядка или других полей связи хроники с заявкой (требуется авторизация)
     *
     * @tags chronicle_research
     * @name ChronicleResearchChroniclesUpdate
     * @summary Обновить хронику в заявке
     * @request PUT:/api/chronicle_research/{id}/chronicles/{chronicle_id}
     * @secure
     */
    chronicleResearchChroniclesUpdate: (
      id: number,
      chronicleId: number,
      updates: object,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/chronicle_research/${id}/chronicles/${chronicleId}`,
        method: "PUT",
        body: updates,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаление хроники из заявки (требуется авторизация)
     *
     * @tags chronicle_research
     * @name ChronicleResearchChroniclesDelete
     * @summary Удалить хронику из заявки
     * @request DELETE:/api/chronicle_research/{id}/chronicles/{chronicle_id}
     * @secure
     */
    chronicleResearchChroniclesDelete: (
      id: number,
      chronicleId: number,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/chronicle_research/${id}/chronicles/${chronicleId}`,
        method: "DELETE",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получить список всех хроник с возможностью фильтрации по названию, автору и локации
     *
     * @tags chronicle_resources
     * @name ChronicleResourcesList
     * @summary Получить список хроник
     * @request GET:/api/chronicle_resources
     */
    chronicleResourcesList: (
      query?: {
        /** Фильтр по названию */
        title?: string;
        /** Фильтр по автору */
        author?: string;
        /** Фильтр по локации */
        location?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/chronicle_resources`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Создание новой хроники (требуется авторизация)
     *
     * @tags chronicle_resources
     * @name ChronicleResourcesCreate
     * @summary Создать хронику
     * @request POST:/api/chronicle_resources
     * @secure
     */
    chronicleResourcesCreate: (
      chronicle: Lab1IntermalAppDsChronicleResource,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/chronicle_resources`,
        method: "POST",
        body: chronicle,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получить детальную информацию о хронике по идентификатору
     *
     * @tags chronicle_resources
     * @name ChronicleResourcesDetail
     * @summary Получить хронику по ID
     * @request GET:/api/chronicle_resources/{id_chronicle_resource}
     */
    chronicleResourcesDetail: (
      idChronicleResource: number,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/chronicle_resources/${idChronicleResource}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновление существующей хроники (требуется авторизация)
     *
     * @tags chronicle_resources
     * @name ChronicleResourcesUpdate
     * @summary Обновить хронику
     * @request PUT:/api/chronicle_resources/{id_chronicle_resource}
     * @secure
     */
    chronicleResourcesUpdate: (
      idChronicleResource: number,
      chronicle: Lab1IntermalAppDsChronicleResource,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/chronicle_resources/${idChronicleResource}`,
        method: "PUT",
        body: chronicle,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаление хроники по ID (требуется авторизация)
     *
     * @tags chronicle_resources
     * @name ChronicleResourcesDelete
     * @summary Удалить хронику
     * @request DELETE:/api/chronicle_resources/{id_chronicle_resource}
     * @secure
     */
    chronicleResourcesDelete: (
      idChronicleResource: number,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/chronicle_resources/${idChronicleResource}`,
        method: "DELETE",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавление хроники в черновик заявки (требуется авторизация)
     *
     * @tags chronicle_resources
     * @name ChronicleResourcesAddToChronicleRequestCreate
     * @summary Добавить хронику в заявку
     * @request POST:/api/chronicle_resources/{id_chronicle_resource}/add_to_chronicle_request
     * @secure
     */
    chronicleResourcesAddToChronicleRequestCreate: (
      idChronicleResource: number,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/chronicle_resources/${idChronicleResource}/add_to_chronicle_request`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Загрузка изображения для хроники (требуется авторизация)
     *
     * @tags chronicle_resources
     * @name ChronicleResourcesImageCreate
     * @summary Загрузить изображение хроники
     * @request POST:/api/chronicle_resources/{id_chronicle_resource}/image
     * @secure
     */
    chronicleResourcesImageCreate: (
      idChronicleResource: number,
      data: {
        /** Изображение */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/chronicle_resources/${idChronicleResource}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Получение данных профиля текущего авторизованного пользователя
     *
     * @tags user
     * @name UserProfileList
     * @summary Получить профиль пользователя
     * @request GET:/api/user/profile
     * @secure
     */
    userProfileList: (params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/user/profile`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновление данных профиля текущего авторизованного пользователя (имя, пароль)
     *
     * @tags user
     * @name UserProfileUpdate
     * @summary Обновить профиль пользователя
     * @request PUT:/api/user/profile
     * @secure
     */
    userProfileUpdate: (
      profile: {
        name?: string;
        password?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/user/profile`,
        method: "PUT",
        body: profile,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  login = {
    /**
     * @description Аутентификация пользователя и получение JWT токена
     *
     * @tags auth
     * @name LoginCreate
     * @summary Вход пользователя
     * @request POST:/login
     */
    loginCreate: (
      request: IntermalAppHandlerLoginReq,
      params: RequestParams = {},
    ) =>
      this.request<IntermalAppHandlerLoginResp, Record<string, string>>({
        path: `/login`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  logout = {
    /**
     * @description Добавление JWT токена в блеклист (logout)
     *
     * @tags auth
     * @name LogoutCreate
     * @summary Выход пользователя
     * @request POST:/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/logout`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  signUp = {
    /**
     * @description Создание нового пользователя с ролью Исследователь
     *
     * @tags auth
     * @name SignUpCreate
     * @summary Регистрация нового пользователя
     * @request POST:/sign_up
     */
    signUpCreate: (
      request: IntermalAppHandlerRegisterReq,
      params: RequestParams = {},
    ) =>
      this.request<IntermalAppHandlerRegisterResp, Record<string, string>>({
        path: `/sign_up`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
