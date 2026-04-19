export function ok(res, data = {}, meta = {}, status = 200) {
  return res.status(status).json({
    success: true,
    data,
    meta,
  });
}

export function fail(res, message, code = "UNKNOWN_ERROR", status = 400, details = null) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}

