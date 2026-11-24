package com.bezkoder.springjwt.utils;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;

/**
 * Writes a fixed placeholder instead of the real value, so password fields are
 * never sent to the browser while edit forms that expect a value keep working.
 */
public class MaskedStringSerializer extends JsonSerializer<String> {
    @Override
    public void serialize(String value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeString("********");
    }
}
