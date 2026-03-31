package com.hawkscope.backend.exception;

import com.hawkscope.backend.dto.ErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponseDto error = new ErrorResponseDto(
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            ex.getMessage()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleNoHandlerFound(NoHandlerFoundException ex) {
        ErrorResponseDto error = new ErrorResponseDto(
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            "El recurso solicitado no existe."
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class, IllegalArgumentException.class})
    public ResponseEntity<ErrorResponseDto> handleBadRequest(Exception ex) {
        ErrorResponseDto error = new ErrorResponseDto(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            ex.getMessage() != null && !ex.getMessage().isEmpty() ? ex.getMessage() : "Datos de entrada inválidos o incompletos."
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneralException(Exception ex) {
        ex.printStackTrace(); // Log error for PM2/AWS logs
        ErrorResponseDto error = new ErrorResponseDto(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal Server Error",
            "Fallo inesperado en la lógica de la nube."
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
