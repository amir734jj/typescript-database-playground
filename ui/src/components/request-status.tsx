export function RequestStatus({
  busy,
  error,
  notice,
}: {
  busy: boolean;
  error: string;
  notice: string;
}) {
  return (
    <>
      {error && (
        <div class="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div class="alert alert-success" role="status">
          {notice}
        </div>
      )}
      {busy && (
        <div class="d-flex align-items-center gap-2 mb-3" role="status">
          <span class="spinner-border spinner-border-sm" aria-hidden="true" />
          Working...
        </div>
      )}
    </>
  );
}
