/**
 * Local definition of the Express Multer `File` type.
 *
 * This replaces `@types/multer` so the code does not depend on dev-only type
 * packages. That matters because production builds that install only production
 * dependencies (`pnpm install --prod`) do not have `@types/multer` available,
 * which caused: "Namespace 'global.Express' has no exported member 'Multer'."
 *
 * The runtime `multer` package itself is already a production dependency of
 * `@nestjs/platform-express`.
 */
declare namespace Express {
  namespace Multer {
    /** Object containing file metadata and access information. */
    interface File {
      /** Name of the form field associated with this file. */
      fieldname: string
      /** Name of the file on the uploader's computer. */
      originalname: string
      /** Value of the `Content-Transfer-Encoding` header for this file. */
      encoding: string
      /** Value of the `Content-Type` header for this file. */
      mimetype: string
      /** Size of the file in bytes. */
      size: number
      /** A readable stream of this file. */
      stream: NodeJS.ReadableStream
      /** `DiskStorage` only: Directory to which this file has been uploaded. */
      destination: string
      /** `DiskStorage` only: Name of this file within `destination`. */
      filename: string
      /** `DiskStorage` only: Full path to the uploaded file. */
      path: string
      /** `MemoryStorage` only: A Buffer containing the entire file. */
      buffer: Buffer
    }
  }

  interface Request {
    /** `Multer.File` object populated by `single()` middleware. */
    file?: Multer.File | undefined
    /**
     * Array or dictionary of `Multer.File` object populated by `array()`,
     * `fields()`, and `any()` middleware.
     */
    files?:
      | {
          [fieldname: string]: Multer.File[]
        }
      | Multer.File[]
      | undefined
  }
}
