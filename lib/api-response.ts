interface ApiResponse<T> {
  data?: T | null;
  statusCode: ApiResponseStatusCode;
  message?: string;
}

export enum ApiResponseStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
}

export function apiResponse<T>(props: ApiResponse<T>) {
  return {
    ...props,
    message:
      props.statusCode === ApiResponseStatusCode.INTERNAL_SERVER
        ? "Internal Server Error"
        : (props.message ?? ""),
  };
}
