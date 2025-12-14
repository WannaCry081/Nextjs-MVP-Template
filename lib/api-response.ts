export interface ApiResponse<T> {
  success?: boolean;
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
  const SUCCESS_CODES = [
    ApiResponseStatusCode.OK,
    ApiResponseStatusCode.CREATED,
    ApiResponseStatusCode.NO_CONTENT,
  ];

  const isInternalServerError = props.statusCode === ApiResponseStatusCode.INTERNAL_SERVER;
  const isSuccess = SUCCESS_CODES.includes(props.statusCode);

  return {
    ...props,
    success: isSuccess,
    message: isInternalServerError ? "Internal Server Error" : (props.message ?? ""),
  };
}
