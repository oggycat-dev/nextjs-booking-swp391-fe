/**
 * Error Utilities
 * Helper functions to parse and format API errors
 */

interface ApiErrorResponse {
    message?: string;
    errors?: string[];
    statusCode?: number;
}

/**
 * Parse API error and extract readable message
 */
export function parseApiError(error: unknown): { title: string; description: string } {
    // Default error
    let title = "Đã xảy ra lỗi";
    let description = "Vui lòng thử lại sau.";

    try {
        if (error instanceof Error) {
            const errorMessage = error.message;

            // Try to parse JSON error response from backend
            try {
                const jsonMatch = errorMessage.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const errorData: ApiErrorResponse = JSON.parse(jsonMatch[0]);

                    if (errorData.message) {
                        title = "Thao tác thất bại";
                        description = errorData.message;
                    }

                    // If there are additional errors, append them
                    if (errorData.errors && errorData.errors.length > 0) {
                        description += "\n\nChi tiết:\n" + errorData.errors.join("\n");
                    }

                    return { title, description };
                }
            } catch {
                // Not JSON, continue with plain text parsing
            }

            // Check for specific error patterns
            if (errorMessage.toLowerCase().includes("conflict") ||
                errorMessage.toLowerCase().includes("already booked") ||
                errorMessage.toLowerCase().includes("overlapping")) {
                title = "Xung đột đặt phòng";
                description = "Phòng đã được đặt trong khung giờ này. Vui lòng chọn phòng khác.";
            } else if (errorMessage.toLowerCase().includes("not available") ||
                errorMessage.toLowerCase().includes("unavailable")) {
                title = "Phòng không khả dụng";
                description = "Phòng hiện không khả dụng. Vui lòng chọn phòng khác.";
            } else if (errorMessage.toLowerCase().includes("not found")) {
                title = "Không tìm thấy";
                description = "Không tìm thấy thông tin. Vui lòng tải lại trang và thử lại.";
            } else if (errorMessage.toLowerCase().includes("unauthorized")) {
                title = "Không có quyền";
                description = "Bạn không có quyền thực hiện thao tác này.";
            } else if (errorMessage.toLowerCase().includes("validation")) {
                title = "Dữ liệu không hợp lệ";
                description = errorMessage;
            } else {
                // Use the error message as is
                description = errorMessage;
            }
        } else if (typeof error === "string") {
            description = error;
        }
    } catch {
        // Use default error
    }

    return { title, description };
}

/**
 * Format error for console logging
 */
export function logError(context: string, error: unknown): void {
    console.error(`[${context}]`, error);

    if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
    }
}
