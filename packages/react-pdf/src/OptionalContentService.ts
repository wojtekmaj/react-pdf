import type { PDFDocumentProxy } from "pdfjs-dist";
import type { OptionalContentConfig } from "pdfjs-dist/types/src/display/optional_content_config.js";

/**
 * A service responsible for managing the optional content configuration (OCC) of a PDF document
 * and controlling the visibility of optional content groups (OCGs).
 */
export default class OptionalContentService {
  private optionalContentConfig?: OptionalContentConfig;
  private pdfDocument?: PDFDocumentProxy | null;
  private visibilityChangeListener: Array<(id: string, visible?: boolean) => void>;

  constructor() {
    this.pdfDocument = undefined;
    this.visibilityChangeListener = [];
  }

  /**
   * Sets the PDF document for internal use.
   *
   * @param {PDFDocumentProxy} pdfDocument - The PDF document instance to be set.
   * @return {void}
   */
  public setDocument(pdfDocument: PDFDocumentProxy): void {
    this.pdfDocument = pdfDocument;
  }

  /**
   * Loads the optional content configuration for the associated PDF document.
   * If the PDF document is not set or the configuration cannot be loaded, an error will be thrown.
   *
   * @return {Promise<OptionalContentConfig>} A promise that resolves to the loaded optional content configuration.
   * @throws {Error} Throws an error if the PDF document is not set or the configuration cannot be loaded.
   */
  public async loadOptionalContentConfig(): Promise<OptionalContentConfig> {
    if (!this.pdfDocument) {
      throw new Error("The PDF document is not set. Call setDocument() first.");
    }

    this.optionalContentConfig = await this.pdfDocument.getOptionalContentConfig();

    if (!this.optionalContentConfig) {
      throw new Error("The optional content configuration could not be loaded.");
    }

    return this.optionalContentConfig;
  }

  /**
   * Retrieves the optional content configuration.
   * Throws an error if the configuration is not loaded before calling this method.
   *
   * @return {OptionalContentConfig} The loaded optional content configuration.
   */
  public getOptionalContentConfig(): OptionalContentConfig {
    if (!this.optionalContentConfig) {
      throw new Error("The optional content configuration is not loaded. Call loadOptionalContentConfig() first.");
    }

    return this.optionalContentConfig;
  }

  /**
   * Sets the visibility of a specific element and optionally preserves the related behavior.
   *
   * @param {string} id - The identifier of the element whose visibility is being set.
   * @param {boolean} [visible] - Optional. Determines whether the element is visible or not. Defaults to undefined.
   * @param {boolean} [preserveRB] - Optional. Indicates if related behavior should be preserved. Defaults to undefined.
   */
  public setVisibility(id: string, visible?: boolean, preserveRB?: boolean): void {
    if (!this.optionalContentConfig) {
      throw new Error("The optional content configuration is not loaded. Call loadOptionalContentConfig() first.");
    }

    this.optionalContentConfig.setVisibility(id, visible, preserveRB);

    for (const listener of this.visibilityChangeListener) {
      listener(id, visible);
    }
  }

  /**
   * Determines whether a specific group identified by its ID is visible
   * in the optional content configuration.
   *
   * @param {string} id - The identifier of the group to check visibility for.
   * @return {boolean} Returns true if the group is visible; otherwise, false.
   * @throws {Error} Throws an error if the optional content configuration
   *         is not loaded.
   */
  public isVisible(id: string): boolean {
    if (!this.optionalContentConfig) {
      throw new Error("The optional content configuration is not loaded. Call loadOptionalContentConfig() first.");
    }

    return this.optionalContentConfig.getGroup(id).visible;
  }

  /**
   * Registers a listener callback to be invoked whenever a visibility change event occurs.
   *
   * @param {function} callback - A function that is called when a visibility change occurs. The callback receives the following parameters:
   *   - id: The unique identifier of the group with the visibility change.
   *   - visible: Optional parameter indicating the visibility status as a boolean.
   */
  public addVisibilityChangeListener(callback: (id: string, visible?: boolean) => void): void {
    this.visibilityChangeListener.push(callback);
  }

  /**
   * Removes a visibility change listener from the internal listener collection.
   *
   * @param callback A function reference to the listener that should be removed.
   */
  public removeVisibilityChangeListener(callback: (id: string, visible?: boolean) => void): void {
    for (let i = 0, ii = this.visibilityChangeListener.length; i < ii; i++) {
      const listener = this.visibilityChangeListener[i];

      if (listener === callback) {
        this.visibilityChangeListener.splice(i, 1);
        break;
      }
    }
  }
}