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
    let title = "Error";
    let description = "An error occurred";

    try {
        if (error instanceof Error) {
            const errorMessage = error.message;

            // Try to parse JSON error response from backend
            try {
                const jsonMatch = errorMessage.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const errorData: ApiErrorResponse = JSON.parse(jsonMatch[0]);

                    if (errorData.message) {
                        title = "Error";
                        description = errorData.message;
                    }

                    // If there are additional errors, append them
                    if (errorData.errors && errorData.errors.length > 0) {
                        description += "\n\n" + errorData.errors.join("\n");
                    }

                    return { title, description };
                }
            } catch {
                // Not JSON, continue with plain text parsing
            }

            // Check for specific error patterns
            if (errorMessage.toLowerCase().includes("conflicting bookings")) {
                title = "Room Already Booked";
                description = "The selected room is already booked for the remaining time slot. Please choose another room.";
            } else if (errorMessage.toLowerCase().includes("conflict") ||
                errorMessage.toLowerCase().includes("already booked") ||
                errorMessage.toLowerCase().includes("overlapping")) {
                title = "Booking Conflict";
                description = "The room is already booked for this time slot. Please choose another room.";
            } else if (errorMessage.toLowerCase().includes("not available") ||
                errorMessage.toLowerCase().includes("unavailable")) {
                title = "Room Not Available";
                description = "The room is currently not available. Please choose another room.";
            } else if (errorMessage.toLowerCase().includes("not found")) {
                title = "Not Found";
                description = "The requested information was not found. Please refresh the page and try again.";
            } else if (errorMessage.toLowerCase().includes("unauthorized")) {
                title = "Unauthorized";
                description = "You do not have permission to perform this action.";
            } else if (errorMessage.toLowerCase().includes("validation")) {
                title = "Validation Error";
                description = errorMessage;
            } else {
                // Use the error message as is from backend
                title = "Error";
                description = errorMessage;
            }
        } else if (typeof error === "string") {
            title = "Error";
            description = error;
        }
    } catch {
        // Keep the default values
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
