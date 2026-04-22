import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace esp_control. */
export namespace esp_control {

    /** ValueType enum. */
    enum ValueType {
        VALUE_TYPE_UNSPECIFIED = 0,
        VALUE_TYPE_BOOL = 1,
        VALUE_TYPE_INT = 2,
        VALUE_TYPE_UINT = 3,
        VALUE_TYPE_FLOAT = 4,
        VALUE_TYPE_STRING = 5,
        VALUE_TYPE_ENUM = 6,
        VALUE_TYPE_DURATION_MS = 7
    }

    /** ReadMode enum. */
    enum ReadMode {
        READ_MODE_UNSPECIFIED = 0,
        READ_MODE_SNAPSHOT = 1,
        READ_MODE_SUBSCRIBE = 2,
        READ_MODE_POLL = 3
    }

    /** DangerLevel enum. */
    enum DangerLevel {
        DANGER_LEVEL_UNSPECIFIED = 0,
        DANGER_LEVEL_NORMAL = 1,
        DANGER_LEVEL_ELEVATED = 2,
        DANGER_LEVEL_DANGEROUS = 3
    }

    /** NodeKind enum. */
    enum NodeKind {
        NODE_KIND_UNSPECIFIED = 0,
        NODE_KIND_STACK = 1,
        NODE_KIND_ROW = 2,
        NODE_KIND_GRID = 3,
        NODE_KIND_SECTION = 4,
        NODE_KIND_WIDGET = 5
    }

    /** WidgetKind enum. */
    enum WidgetKind {
        WIDGET_KIND_UNSPECIFIED = 0,
        WIDGET_KIND_TEXT = 1,
        WIDGET_KIND_STAT = 2,
        WIDGET_KIND_TOGGLE = 3,
        WIDGET_KIND_BUTTON = 4,
        WIDGET_KIND_SLIDER = 5,
        WIDGET_KIND_SELECT = 6,
        WIDGET_KIND_TEXT_INPUT = 7,
        WIDGET_KIND_BADGE = 8,
        WIDGET_KIND_PROGRESS = 9,
        WIDGET_KIND_TIMER = 10
    }

    /** Properties of a StringEntry. */
    interface IStringEntry {

        /** StringEntry value */
        value?: (string|null);
    }

    /** Represents a StringEntry. */
    class StringEntry implements IStringEntry {

        /**
         * Constructs a new StringEntry.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IStringEntry);

        /** StringEntry value. */
        public value: string;

        /**
         * Creates a new StringEntry instance using the specified properties.
         * @param [properties] Properties to set
         * @returns StringEntry instance
         */
        public static create(properties?: esp_control.IStringEntry): esp_control.StringEntry;

        /**
         * Encodes the specified StringEntry message. Does not implicitly {@link esp_control.StringEntry.verify|verify} messages.
         * @param message StringEntry message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IStringEntry, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified StringEntry message, length delimited. Does not implicitly {@link esp_control.StringEntry.verify|verify} messages.
         * @param message StringEntry message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IStringEntry, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a StringEntry message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns StringEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.StringEntry;

        /**
         * Decodes a StringEntry message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns StringEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.StringEntry;

        /**
         * Verifies a StringEntry message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a StringEntry message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns StringEntry
         */
        public static fromObject(object: { [k: string]: any }): esp_control.StringEntry;

        /**
         * Creates a plain object from a StringEntry message. Also converts values to other types if specified.
         * @param message StringEntry
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.StringEntry, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this StringEntry to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for StringEntry
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Rule. */
    interface IRule {

        /** Rule jsonlogic */
        jsonlogic?: (string|null);
    }

    /** Represents a Rule. */
    class Rule implements IRule {

        /**
         * Constructs a new Rule.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IRule);

        /** Rule jsonlogic. */
        public jsonlogic: string;

        /**
         * Creates a new Rule instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Rule instance
         */
        public static create(properties?: esp_control.IRule): esp_control.Rule;

        /**
         * Encodes the specified Rule message. Does not implicitly {@link esp_control.Rule.verify|verify} messages.
         * @param message Rule message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IRule, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Rule message, length delimited. Does not implicitly {@link esp_control.Rule.verify|verify} messages.
         * @param message Rule message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IRule, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Rule message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Rule
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.Rule;

        /**
         * Decodes a Rule message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Rule
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.Rule;

        /**
         * Verifies a Rule message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Rule message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Rule
         */
        public static fromObject(object: { [k: string]: any }): esp_control.Rule;

        /**
         * Creates a plain object from a Rule message. Also converts values to other types if specified.
         * @param message Rule
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.Rule, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Rule to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Rule
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CommonField. */
    interface ICommonField {

        /** CommonField keyIdx */
        keyIdx?: (number|null);

        /** CommonField value */
        value?: (esp_control.ICommonValue|null);
    }

    /** Represents a CommonField. */
    class CommonField implements ICommonField {

        /**
         * Constructs a new CommonField.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.ICommonField);

        /** CommonField keyIdx. */
        public keyIdx: number;

        /** CommonField value. */
        public value?: (esp_control.ICommonValue|null);

        /**
         * Creates a new CommonField instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CommonField instance
         */
        public static create(properties?: esp_control.ICommonField): esp_control.CommonField;

        /**
         * Encodes the specified CommonField message. Does not implicitly {@link esp_control.CommonField.verify|verify} messages.
         * @param message CommonField message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.ICommonField, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CommonField message, length delimited. Does not implicitly {@link esp_control.CommonField.verify|verify} messages.
         * @param message CommonField message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.ICommonField, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CommonField message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CommonField
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.CommonField;

        /**
         * Decodes a CommonField message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CommonField
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.CommonField;

        /**
         * Verifies a CommonField message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CommonField message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CommonField
         */
        public static fromObject(object: { [k: string]: any }): esp_control.CommonField;

        /**
         * Creates a plain object from a CommonField message. Also converts values to other types if specified.
         * @param message CommonField
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.CommonField, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CommonField to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CommonField
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CommonObject. */
    interface ICommonObject {

        /** CommonObject fields */
        fields?: (esp_control.ICommonField[]|null);
    }

    /** Represents a CommonObject. */
    class CommonObject implements ICommonObject {

        /**
         * Constructs a new CommonObject.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.ICommonObject);

        /** CommonObject fields. */
        public fields: esp_control.ICommonField[];

        /**
         * Creates a new CommonObject instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CommonObject instance
         */
        public static create(properties?: esp_control.ICommonObject): esp_control.CommonObject;

        /**
         * Encodes the specified CommonObject message. Does not implicitly {@link esp_control.CommonObject.verify|verify} messages.
         * @param message CommonObject message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.ICommonObject, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CommonObject message, length delimited. Does not implicitly {@link esp_control.CommonObject.verify|verify} messages.
         * @param message CommonObject message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.ICommonObject, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CommonObject message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CommonObject
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.CommonObject;

        /**
         * Decodes a CommonObject message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CommonObject
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.CommonObject;

        /**
         * Verifies a CommonObject message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CommonObject message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CommonObject
         */
        public static fromObject(object: { [k: string]: any }): esp_control.CommonObject;

        /**
         * Creates a plain object from a CommonObject message. Also converts values to other types if specified.
         * @param message CommonObject
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.CommonObject, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CommonObject to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CommonObject
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CommonList. */
    interface ICommonList {

        /** CommonList items */
        items?: (esp_control.ICommonValue[]|null);
    }

    /** Represents a CommonList. */
    class CommonList implements ICommonList {

        /**
         * Constructs a new CommonList.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.ICommonList);

        /** CommonList items. */
        public items: esp_control.ICommonValue[];

        /**
         * Creates a new CommonList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CommonList instance
         */
        public static create(properties?: esp_control.ICommonList): esp_control.CommonList;

        /**
         * Encodes the specified CommonList message. Does not implicitly {@link esp_control.CommonList.verify|verify} messages.
         * @param message CommonList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.ICommonList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CommonList message, length delimited. Does not implicitly {@link esp_control.CommonList.verify|verify} messages.
         * @param message CommonList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.ICommonList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CommonList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CommonList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.CommonList;

        /**
         * Decodes a CommonList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CommonList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.CommonList;

        /**
         * Verifies a CommonList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CommonList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CommonList
         */
        public static fromObject(object: { [k: string]: any }): esp_control.CommonList;

        /**
         * Creates a plain object from a CommonList message. Also converts values to other types if specified.
         * @param message CommonList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.CommonList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CommonList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CommonList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CommonValue. */
    interface ICommonValue {

        /** CommonValue boolValue */
        boolValue?: (boolean|null);

        /** CommonValue intValue */
        intValue?: (number|null);

        /** CommonValue uintValue */
        uintValue?: (number|null);

        /** CommonValue floatValue */
        floatValue?: (number|null);

        /** CommonValue stringValue */
        stringValue?: (string|null);

        /** CommonValue enumValue */
        enumValue?: (string|null);

        /** CommonValue durationMsValue */
        durationMsValue?: (number|null);

        /** CommonValue objectValue */
        objectValue?: (esp_control.ICommonObject|null);

        /** CommonValue listValue */
        listValue?: (esp_control.ICommonList|null);
    }

    /** Represents a CommonValue. */
    class CommonValue implements ICommonValue {

        /**
         * Constructs a new CommonValue.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.ICommonValue);

        /** CommonValue boolValue. */
        public boolValue?: (boolean|null);

        /** CommonValue intValue. */
        public intValue?: (number|null);

        /** CommonValue uintValue. */
        public uintValue?: (number|null);

        /** CommonValue floatValue. */
        public floatValue?: (number|null);

        /** CommonValue stringValue. */
        public stringValue?: (string|null);

        /** CommonValue enumValue. */
        public enumValue?: (string|null);

        /** CommonValue durationMsValue. */
        public durationMsValue?: (number|null);

        /** CommonValue objectValue. */
        public objectValue?: (esp_control.ICommonObject|null);

        /** CommonValue listValue. */
        public listValue?: (esp_control.ICommonList|null);

        /** CommonValue kind. */
        public kind?: ("boolValue"|"intValue"|"uintValue"|"floatValue"|"stringValue"|"enumValue"|"durationMsValue"|"objectValue"|"listValue");

        /**
         * Creates a new CommonValue instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CommonValue instance
         */
        public static create(properties?: esp_control.ICommonValue): esp_control.CommonValue;

        /**
         * Encodes the specified CommonValue message. Does not implicitly {@link esp_control.CommonValue.verify|verify} messages.
         * @param message CommonValue message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.ICommonValue, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CommonValue message, length delimited. Does not implicitly {@link esp_control.CommonValue.verify|verify} messages.
         * @param message CommonValue message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.ICommonValue, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CommonValue message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CommonValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.CommonValue;

        /**
         * Decodes a CommonValue message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CommonValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.CommonValue;

        /**
         * Verifies a CommonValue message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CommonValue message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CommonValue
         */
        public static fromObject(object: { [k: string]: any }): esp_control.CommonValue;

        /**
         * Creates a plain object from a CommonValue message. Also converts values to other types if specified.
         * @param message CommonValue
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.CommonValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CommonValue to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CommonValue
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CapabilitiesDef. */
    interface ICapabilitiesDef {

        /** CapabilitiesDef featureIdxs */
        featureIdxs?: (number[]|null);
    }

    /** Represents a CapabilitiesDef. */
    class CapabilitiesDef implements ICapabilitiesDef {

        /**
         * Constructs a new CapabilitiesDef.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.ICapabilitiesDef);

        /** CapabilitiesDef featureIdxs. */
        public featureIdxs: number[];

        /**
         * Creates a new CapabilitiesDef instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CapabilitiesDef instance
         */
        public static create(properties?: esp_control.ICapabilitiesDef): esp_control.CapabilitiesDef;

        /**
         * Encodes the specified CapabilitiesDef message. Does not implicitly {@link esp_control.CapabilitiesDef.verify|verify} messages.
         * @param message CapabilitiesDef message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.ICapabilitiesDef, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CapabilitiesDef message, length delimited. Does not implicitly {@link esp_control.CapabilitiesDef.verify|verify} messages.
         * @param message CapabilitiesDef message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.ICapabilitiesDef, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CapabilitiesDef message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CapabilitiesDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.CapabilitiesDef;

        /**
         * Decodes a CapabilitiesDef message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CapabilitiesDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.CapabilitiesDef;

        /**
         * Verifies a CapabilitiesDef message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CapabilitiesDef message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CapabilitiesDef
         */
        public static fromObject(object: { [k: string]: any }): esp_control.CapabilitiesDef;

        /**
         * Creates a plain object from a CapabilitiesDef message. Also converts values to other types if specified.
         * @param message CapabilitiesDef
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.CapabilitiesDef, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CapabilitiesDef to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CapabilitiesDef
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ResourceDef. */
    interface IResourceDef {

        /** ResourceDef id */
        id?: (number|null);

        /** ResourceDef slugIdx */
        slugIdx?: (number|null);

        /** ResourceDef labelIdx */
        labelIdx?: (number|null);

        /** ResourceDef unitIdx */
        unitIdx?: (number|null);

        /** ResourceDef valueType */
        valueType?: (esp_control.ValueType|null);

        /** ResourceDef readMode */
        readMode?: (esp_control.ReadMode|null);

        /** ResourceDef staleAfterMs */
        staleAfterMs?: (number|null);

        /** ResourceDef pollMs */
        pollMs?: (number|null);

        /** ResourceDef enumValueIdxs */
        enumValueIdxs?: (number[]|null);
    }

    /** Represents a ResourceDef. */
    class ResourceDef implements IResourceDef {

        /**
         * Constructs a new ResourceDef.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IResourceDef);

        /** ResourceDef id. */
        public id: number;

        /** ResourceDef slugIdx. */
        public slugIdx: number;

        /** ResourceDef labelIdx. */
        public labelIdx: number;

        /** ResourceDef unitIdx. */
        public unitIdx: number;

        /** ResourceDef valueType. */
        public valueType: esp_control.ValueType;

        /** ResourceDef readMode. */
        public readMode: esp_control.ReadMode;

        /** ResourceDef staleAfterMs. */
        public staleAfterMs: number;

        /** ResourceDef pollMs. */
        public pollMs: number;

        /** ResourceDef enumValueIdxs. */
        public enumValueIdxs: number[];

        /**
         * Creates a new ResourceDef instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ResourceDef instance
         */
        public static create(properties?: esp_control.IResourceDef): esp_control.ResourceDef;

        /**
         * Encodes the specified ResourceDef message. Does not implicitly {@link esp_control.ResourceDef.verify|verify} messages.
         * @param message ResourceDef message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IResourceDef, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ResourceDef message, length delimited. Does not implicitly {@link esp_control.ResourceDef.verify|verify} messages.
         * @param message ResourceDef message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IResourceDef, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ResourceDef message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ResourceDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.ResourceDef;

        /**
         * Decodes a ResourceDef message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ResourceDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.ResourceDef;

        /**
         * Verifies a ResourceDef message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ResourceDef message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ResourceDef
         */
        public static fromObject(object: { [k: string]: any }): esp_control.ResourceDef;

        /**
         * Creates a plain object from a ResourceDef message. Also converts values to other types if specified.
         * @param message ResourceDef
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.ResourceDef, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ResourceDef to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ResourceDef
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an ActionDef. */
    interface IActionDef {

        /** ActionDef id */
        id?: (number|null);

        /** ActionDef slugIdx */
        slugIdx?: (number|null);

        /** ActionDef labelIdx */
        labelIdx?: (number|null);

        /** ActionDef dangerLevel */
        dangerLevel?: (esp_control.DangerLevel|null);

        /** ActionDef confirmIdx */
        confirmIdx?: (number|null);

        /** ActionDef cooldownMs */
        cooldownMs?: (number|null);

        /** ActionDef inputSchemaIdx */
        inputSchemaIdx?: (number|null);

        /** ActionDef resultSchemaIdx */
        resultSchemaIdx?: (number|null);
    }

    /** Represents an ActionDef. */
    class ActionDef implements IActionDef {

        /**
         * Constructs a new ActionDef.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IActionDef);

        /** ActionDef id. */
        public id: number;

        /** ActionDef slugIdx. */
        public slugIdx: number;

        /** ActionDef labelIdx. */
        public labelIdx: number;

        /** ActionDef dangerLevel. */
        public dangerLevel: esp_control.DangerLevel;

        /** ActionDef confirmIdx. */
        public confirmIdx: number;

        /** ActionDef cooldownMs. */
        public cooldownMs: number;

        /** ActionDef inputSchemaIdx. */
        public inputSchemaIdx: number;

        /** ActionDef resultSchemaIdx. */
        public resultSchemaIdx: number;

        /**
         * Creates a new ActionDef instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ActionDef instance
         */
        public static create(properties?: esp_control.IActionDef): esp_control.ActionDef;

        /**
         * Encodes the specified ActionDef message. Does not implicitly {@link esp_control.ActionDef.verify|verify} messages.
         * @param message ActionDef message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IActionDef, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ActionDef message, length delimited. Does not implicitly {@link esp_control.ActionDef.verify|verify} messages.
         * @param message ActionDef message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IActionDef, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an ActionDef message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ActionDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.ActionDef;

        /**
         * Decodes an ActionDef message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ActionDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.ActionDef;

        /**
         * Verifies an ActionDef message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an ActionDef message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ActionDef
         */
        public static fromObject(object: { [k: string]: any }): esp_control.ActionDef;

        /**
         * Creates a plain object from an ActionDef message. Also converts values to other types if specified.
         * @param message ActionDef
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.ActionDef, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ActionDef to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ActionDef
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ScreenDef. */
    interface IScreenDef {

        /** ScreenDef id */
        id?: (number|null);

        /** ScreenDef slugIdx */
        slugIdx?: (number|null);

        /** ScreenDef titleIdx */
        titleIdx?: (number|null);

        /** ScreenDef routeKeyIdx */
        routeKeyIdx?: (number|null);

        /** ScreenDef rootNodeId */
        rootNodeId?: (number|null);

        /** ScreenDef entryRules */
        entryRules?: (esp_control.IRule[]|null);
    }

    /** Represents a ScreenDef. */
    class ScreenDef implements IScreenDef {

        /**
         * Constructs a new ScreenDef.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IScreenDef);

        /** ScreenDef id. */
        public id: number;

        /** ScreenDef slugIdx. */
        public slugIdx: number;

        /** ScreenDef titleIdx. */
        public titleIdx: number;

        /** ScreenDef routeKeyIdx. */
        public routeKeyIdx: number;

        /** ScreenDef rootNodeId. */
        public rootNodeId: number;

        /** ScreenDef entryRules. */
        public entryRules: esp_control.IRule[];

        /**
         * Creates a new ScreenDef instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ScreenDef instance
         */
        public static create(properties?: esp_control.IScreenDef): esp_control.ScreenDef;

        /**
         * Encodes the specified ScreenDef message. Does not implicitly {@link esp_control.ScreenDef.verify|verify} messages.
         * @param message ScreenDef message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IScreenDef, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ScreenDef message, length delimited. Does not implicitly {@link esp_control.ScreenDef.verify|verify} messages.
         * @param message ScreenDef message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IScreenDef, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ScreenDef message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ScreenDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.ScreenDef;

        /**
         * Decodes a ScreenDef message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ScreenDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.ScreenDef;

        /**
         * Verifies a ScreenDef message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ScreenDef message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ScreenDef
         */
        public static fromObject(object: { [k: string]: any }): esp_control.ScreenDef;

        /**
         * Creates a plain object from a ScreenDef message. Also converts values to other types if specified.
         * @param message ScreenDef
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.ScreenDef, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ScreenDef to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ScreenDef
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a BindingDef. */
    interface IBindingDef {

        /** BindingDef resourceId */
        resourceId?: (number|null);

        /** BindingDef actionId */
        actionId?: (number|null);
    }

    /** Represents a BindingDef. */
    class BindingDef implements IBindingDef {

        /**
         * Constructs a new BindingDef.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IBindingDef);

        /** BindingDef resourceId. */
        public resourceId: number;

        /** BindingDef actionId. */
        public actionId: number;

        /**
         * Creates a new BindingDef instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BindingDef instance
         */
        public static create(properties?: esp_control.IBindingDef): esp_control.BindingDef;

        /**
         * Encodes the specified BindingDef message. Does not implicitly {@link esp_control.BindingDef.verify|verify} messages.
         * @param message BindingDef message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IBindingDef, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified BindingDef message, length delimited. Does not implicitly {@link esp_control.BindingDef.verify|verify} messages.
         * @param message BindingDef message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IBindingDef, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BindingDef message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns BindingDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.BindingDef;

        /**
         * Decodes a BindingDef message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns BindingDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.BindingDef;

        /**
         * Verifies a BindingDef message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a BindingDef message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns BindingDef
         */
        public static fromObject(object: { [k: string]: any }): esp_control.BindingDef;

        /**
         * Creates a plain object from a BindingDef message. Also converts values to other types if specified.
         * @param message BindingDef
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.BindingDef, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this BindingDef to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for BindingDef
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a NodeDef. */
    interface INodeDef {

        /** NodeDef id */
        id?: (number|null);

        /** NodeDef slugIdx */
        slugIdx?: (number|null);

        /** NodeDef kind */
        kind?: (esp_control.NodeKind|null);

        /** NodeDef widgetKind */
        widgetKind?: (esp_control.WidgetKind|null);

        /** NodeDef titleIdx */
        titleIdx?: (number|null);

        /** NodeDef toneIdx */
        toneIdx?: (number|null);

        /** NodeDef childrenIds */
        childrenIds?: (number[]|null);

        /** NodeDef columns */
        columns?: (number|null);

        /** NodeDef bind */
        bind?: (esp_control.IBindingDef|null);

        /** NodeDef visibleIf */
        visibleIf?: (esp_control.IRule|null);

        /** NodeDef enabledIf */
        enabledIf?: (esp_control.IRule|null);

        /** NodeDef textIdx */
        textIdx?: (number|null);

        /** NodeDef formatHintIdx */
        formatHintIdx?: (number|null);
    }

    /** Represents a NodeDef. */
    class NodeDef implements INodeDef {

        /**
         * Constructs a new NodeDef.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.INodeDef);

        /** NodeDef id. */
        public id: number;

        /** NodeDef slugIdx. */
        public slugIdx: number;

        /** NodeDef kind. */
        public kind: esp_control.NodeKind;

        /** NodeDef widgetKind. */
        public widgetKind: esp_control.WidgetKind;

        /** NodeDef titleIdx. */
        public titleIdx: number;

        /** NodeDef toneIdx. */
        public toneIdx: number;

        /** NodeDef childrenIds. */
        public childrenIds: number[];

        /** NodeDef columns. */
        public columns: number;

        /** NodeDef bind. */
        public bind?: (esp_control.IBindingDef|null);

        /** NodeDef visibleIf. */
        public visibleIf?: (esp_control.IRule|null);

        /** NodeDef enabledIf. */
        public enabledIf?: (esp_control.IRule|null);

        /** NodeDef textIdx. */
        public textIdx: number;

        /** NodeDef formatHintIdx. */
        public formatHintIdx: number;

        /**
         * Creates a new NodeDef instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NodeDef instance
         */
        public static create(properties?: esp_control.INodeDef): esp_control.NodeDef;

        /**
         * Encodes the specified NodeDef message. Does not implicitly {@link esp_control.NodeDef.verify|verify} messages.
         * @param message NodeDef message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.INodeDef, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified NodeDef message, length delimited. Does not implicitly {@link esp_control.NodeDef.verify|verify} messages.
         * @param message NodeDef message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.INodeDef, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a NodeDef message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns NodeDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.NodeDef;

        /**
         * Decodes a NodeDef message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns NodeDef
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.NodeDef;

        /**
         * Verifies a NodeDef message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a NodeDef message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns NodeDef
         */
        public static fromObject(object: { [k: string]: any }): esp_control.NodeDef;

        /**
         * Creates a plain object from a NodeDef message. Also converts values to other types if specified.
         * @param message NodeDef
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.NodeDef, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this NodeDef to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for NodeDef
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ManifestBundle. */
    interface IManifestBundle {

        /** ManifestBundle version */
        version?: (number|null);

        /** ManifestBundle schemaVersion */
        schemaVersion?: (number|null);

        /** ManifestBundle minAppVersion */
        minAppVersion?: (string|null);

        /** ManifestBundle capabilities */
        capabilities?: (esp_control.ICapabilitiesDef|null);

        /** ManifestBundle strings */
        strings?: (esp_control.IStringEntry[]|null);

        /** ManifestBundle resources */
        resources?: (esp_control.IResourceDef[]|null);

        /** ManifestBundle actions */
        actions?: (esp_control.IActionDef[]|null);

        /** ManifestBundle screens */
        screens?: (esp_control.IScreenDef[]|null);

        /** ManifestBundle nodes */
        nodes?: (esp_control.INodeDef[]|null);
    }

    /** Represents a ManifestBundle. */
    class ManifestBundle implements IManifestBundle {

        /**
         * Constructs a new ManifestBundle.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IManifestBundle);

        /** ManifestBundle version. */
        public version: number;

        /** ManifestBundle schemaVersion. */
        public schemaVersion: number;

        /** ManifestBundle minAppVersion. */
        public minAppVersion: string;

        /** ManifestBundle capabilities. */
        public capabilities?: (esp_control.ICapabilitiesDef|null);

        /** ManifestBundle strings. */
        public strings: esp_control.IStringEntry[];

        /** ManifestBundle resources. */
        public resources: esp_control.IResourceDef[];

        /** ManifestBundle actions. */
        public actions: esp_control.IActionDef[];

        /** ManifestBundle screens. */
        public screens: esp_control.IScreenDef[];

        /** ManifestBundle nodes. */
        public nodes: esp_control.INodeDef[];

        /**
         * Creates a new ManifestBundle instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ManifestBundle instance
         */
        public static create(properties?: esp_control.IManifestBundle): esp_control.ManifestBundle;

        /**
         * Encodes the specified ManifestBundle message. Does not implicitly {@link esp_control.ManifestBundle.verify|verify} messages.
         * @param message ManifestBundle message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IManifestBundle, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ManifestBundle message, length delimited. Does not implicitly {@link esp_control.ManifestBundle.verify|verify} messages.
         * @param message ManifestBundle message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IManifestBundle, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ManifestBundle message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ManifestBundle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.ManifestBundle;

        /**
         * Decodes a ManifestBundle message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ManifestBundle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.ManifestBundle;

        /**
         * Verifies a ManifestBundle message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ManifestBundle message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ManifestBundle
         */
        public static fromObject(object: { [k: string]: any }): esp_control.ManifestBundle;

        /**
         * Creates a plain object from a ManifestBundle message. Also converts values to other types if specified.
         * @param message ManifestBundle
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.ManifestBundle, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ManifestBundle to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ManifestBundle
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Status enum. */
    enum Status {
        STATUS_UNSPECIFIED = 0,
        STATUS_OK = 1,
        STATUS_BAD_PAYLOAD = 2,
        STATUS_UNKNOWN_ACTION = 3,
        STATUS_UNAUTHORIZED = 4,
        STATUS_INTERNAL = 5
    }

    /** Properties of a ResourceValue. */
    interface IResourceValue {

        /** ResourceValue resourceId */
        resourceId?: (number|null);

        /** ResourceValue value */
        value?: (esp_control.ICommonValue|null);
    }

    /** Represents a ResourceValue. */
    class ResourceValue implements IResourceValue {

        /**
         * Constructs a new ResourceValue.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IResourceValue);

        /** ResourceValue resourceId. */
        public resourceId: number;

        /** ResourceValue value. */
        public value?: (esp_control.ICommonValue|null);

        /**
         * Creates a new ResourceValue instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ResourceValue instance
         */
        public static create(properties?: esp_control.IResourceValue): esp_control.ResourceValue;

        /**
         * Encodes the specified ResourceValue message. Does not implicitly {@link esp_control.ResourceValue.verify|verify} messages.
         * @param message ResourceValue message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IResourceValue, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ResourceValue message, length delimited. Does not implicitly {@link esp_control.ResourceValue.verify|verify} messages.
         * @param message ResourceValue message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IResourceValue, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ResourceValue message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ResourceValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.ResourceValue;

        /**
         * Decodes a ResourceValue message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ResourceValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.ResourceValue;

        /**
         * Verifies a ResourceValue message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ResourceValue message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ResourceValue
         */
        public static fromObject(object: { [k: string]: any }): esp_control.ResourceValue;

        /**
         * Creates a plain object from a ResourceValue message. Also converts values to other types if specified.
         * @param message ResourceValue
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.ResourceValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ResourceValue to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ResourceValue
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ResourceSnapshot. */
    interface IResourceSnapshot {

        /** ResourceSnapshot values */
        values?: (esp_control.IResourceValue[]|null);

        /** ResourceSnapshot generation */
        generation?: (number|null);
    }

    /** Represents a ResourceSnapshot. */
    class ResourceSnapshot implements IResourceSnapshot {

        /**
         * Constructs a new ResourceSnapshot.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IResourceSnapshot);

        /** ResourceSnapshot values. */
        public values: esp_control.IResourceValue[];

        /** ResourceSnapshot generation. */
        public generation: number;

        /**
         * Creates a new ResourceSnapshot instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ResourceSnapshot instance
         */
        public static create(properties?: esp_control.IResourceSnapshot): esp_control.ResourceSnapshot;

        /**
         * Encodes the specified ResourceSnapshot message. Does not implicitly {@link esp_control.ResourceSnapshot.verify|verify} messages.
         * @param message ResourceSnapshot message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IResourceSnapshot, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ResourceSnapshot message, length delimited. Does not implicitly {@link esp_control.ResourceSnapshot.verify|verify} messages.
         * @param message ResourceSnapshot message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IResourceSnapshot, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ResourceSnapshot message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ResourceSnapshot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.ResourceSnapshot;

        /**
         * Decodes a ResourceSnapshot message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ResourceSnapshot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.ResourceSnapshot;

        /**
         * Verifies a ResourceSnapshot message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ResourceSnapshot message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ResourceSnapshot
         */
        public static fromObject(object: { [k: string]: any }): esp_control.ResourceSnapshot;

        /**
         * Creates a plain object from a ResourceSnapshot message. Also converts values to other types if specified.
         * @param message ResourceSnapshot
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.ResourceSnapshot, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ResourceSnapshot to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ResourceSnapshot
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ResourceDelta. */
    interface IResourceDelta {

        /** ResourceDelta resourceId */
        resourceId?: (number|null);

        /** ResourceDelta value */
        value?: (esp_control.ICommonValue|null);

        /** ResourceDelta generation */
        generation?: (number|null);
    }

    /** Represents a ResourceDelta. */
    class ResourceDelta implements IResourceDelta {

        /**
         * Constructs a new ResourceDelta.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IResourceDelta);

        /** ResourceDelta resourceId. */
        public resourceId: number;

        /** ResourceDelta value. */
        public value?: (esp_control.ICommonValue|null);

        /** ResourceDelta generation. */
        public generation: number;

        /**
         * Creates a new ResourceDelta instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ResourceDelta instance
         */
        public static create(properties?: esp_control.IResourceDelta): esp_control.ResourceDelta;

        /**
         * Encodes the specified ResourceDelta message. Does not implicitly {@link esp_control.ResourceDelta.verify|verify} messages.
         * @param message ResourceDelta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IResourceDelta, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ResourceDelta message, length delimited. Does not implicitly {@link esp_control.ResourceDelta.verify|verify} messages.
         * @param message ResourceDelta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IResourceDelta, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ResourceDelta message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ResourceDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.ResourceDelta;

        /**
         * Decodes a ResourceDelta message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ResourceDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.ResourceDelta;

        /**
         * Verifies a ResourceDelta message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ResourceDelta message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ResourceDelta
         */
        public static fromObject(object: { [k: string]: any }): esp_control.ResourceDelta;

        /**
         * Creates a plain object from a ResourceDelta message. Also converts values to other types if specified.
         * @param message ResourceDelta
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.ResourceDelta, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ResourceDelta to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ResourceDelta
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an InvokeAction. */
    interface IInvokeAction {

        /** InvokeAction actionId */
        actionId?: (number|null);

        /** InvokeAction payload */
        payload?: (esp_control.ICommonValue|null);

        /** InvokeAction correlationId */
        correlationId?: (number|null);
    }

    /** Represents an InvokeAction. */
    class InvokeAction implements IInvokeAction {

        /**
         * Constructs a new InvokeAction.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IInvokeAction);

        /** InvokeAction actionId. */
        public actionId: number;

        /** InvokeAction payload. */
        public payload?: (esp_control.ICommonValue|null);

        /** InvokeAction correlationId. */
        public correlationId: number;

        /**
         * Creates a new InvokeAction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns InvokeAction instance
         */
        public static create(properties?: esp_control.IInvokeAction): esp_control.InvokeAction;

        /**
         * Encodes the specified InvokeAction message. Does not implicitly {@link esp_control.InvokeAction.verify|verify} messages.
         * @param message InvokeAction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IInvokeAction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified InvokeAction message, length delimited. Does not implicitly {@link esp_control.InvokeAction.verify|verify} messages.
         * @param message InvokeAction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IInvokeAction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an InvokeAction message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns InvokeAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.InvokeAction;

        /**
         * Decodes an InvokeAction message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns InvokeAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.InvokeAction;

        /**
         * Verifies an InvokeAction message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an InvokeAction message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns InvokeAction
         */
        public static fromObject(object: { [k: string]: any }): esp_control.InvokeAction;

        /**
         * Creates a plain object from an InvokeAction message. Also converts values to other types if specified.
         * @param message InvokeAction
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.InvokeAction, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this InvokeAction to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for InvokeAction
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an InvokeResult. */
    interface IInvokeResult {

        /** InvokeResult correlationId */
        correlationId?: (number|null);

        /** InvokeResult status */
        status?: (esp_control.Status|null);

        /** InvokeResult payload */
        payload?: (esp_control.ICommonValue|null);

        /** InvokeResult message */
        message?: (string|null);
    }

    /** Represents an InvokeResult. */
    class InvokeResult implements IInvokeResult {

        /**
         * Constructs a new InvokeResult.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IInvokeResult);

        /** InvokeResult correlationId. */
        public correlationId: number;

        /** InvokeResult status. */
        public status: esp_control.Status;

        /** InvokeResult payload. */
        public payload?: (esp_control.ICommonValue|null);

        /** InvokeResult message. */
        public message: string;

        /**
         * Creates a new InvokeResult instance using the specified properties.
         * @param [properties] Properties to set
         * @returns InvokeResult instance
         */
        public static create(properties?: esp_control.IInvokeResult): esp_control.InvokeResult;

        /**
         * Encodes the specified InvokeResult message. Does not implicitly {@link esp_control.InvokeResult.verify|verify} messages.
         * @param message InvokeResult message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IInvokeResult, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified InvokeResult message, length delimited. Does not implicitly {@link esp_control.InvokeResult.verify|verify} messages.
         * @param message InvokeResult message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IInvokeResult, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an InvokeResult message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns InvokeResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.InvokeResult;

        /**
         * Decodes an InvokeResult message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns InvokeResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.InvokeResult;

        /**
         * Verifies an InvokeResult message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an InvokeResult message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns InvokeResult
         */
        public static fromObject(object: { [k: string]: any }): esp_control.InvokeResult;

        /**
         * Creates a plain object from an InvokeResult message. Also converts values to other types if specified.
         * @param message InvokeResult
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.InvokeResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this InvokeResult to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for InvokeResult
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Subscribe. */
    interface ISubscribe {

        /** Subscribe resourceIds */
        resourceIds?: (number[]|null);
    }

    /** Represents a Subscribe. */
    class Subscribe implements ISubscribe {

        /**
         * Constructs a new Subscribe.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.ISubscribe);

        /** Subscribe resourceIds. */
        public resourceIds: number[];

        /**
         * Creates a new Subscribe instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Subscribe instance
         */
        public static create(properties?: esp_control.ISubscribe): esp_control.Subscribe;

        /**
         * Encodes the specified Subscribe message. Does not implicitly {@link esp_control.Subscribe.verify|verify} messages.
         * @param message Subscribe message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.ISubscribe, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Subscribe message, length delimited. Does not implicitly {@link esp_control.Subscribe.verify|verify} messages.
         * @param message Subscribe message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.ISubscribe, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Subscribe message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Subscribe
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.Subscribe;

        /**
         * Decodes a Subscribe message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Subscribe
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.Subscribe;

        /**
         * Verifies a Subscribe message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Subscribe message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Subscribe
         */
        public static fromObject(object: { [k: string]: any }): esp_control.Subscribe;

        /**
         * Creates a plain object from a Subscribe message. Also converts values to other types if specified.
         * @param message Subscribe
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.Subscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Subscribe to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Subscribe
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an Unsubscribe. */
    interface IUnsubscribe {

        /** Unsubscribe resourceIds */
        resourceIds?: (number[]|null);
    }

    /** Represents an Unsubscribe. */
    class Unsubscribe implements IUnsubscribe {

        /**
         * Constructs a new Unsubscribe.
         * @param [properties] Properties to set
         */
        constructor(properties?: esp_control.IUnsubscribe);

        /** Unsubscribe resourceIds. */
        public resourceIds: number[];

        /**
         * Creates a new Unsubscribe instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Unsubscribe instance
         */
        public static create(properties?: esp_control.IUnsubscribe): esp_control.Unsubscribe;

        /**
         * Encodes the specified Unsubscribe message. Does not implicitly {@link esp_control.Unsubscribe.verify|verify} messages.
         * @param message Unsubscribe message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: esp_control.IUnsubscribe, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Unsubscribe message, length delimited. Does not implicitly {@link esp_control.Unsubscribe.verify|verify} messages.
         * @param message Unsubscribe message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: esp_control.IUnsubscribe, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Unsubscribe message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Unsubscribe
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): esp_control.Unsubscribe;

        /**
         * Decodes an Unsubscribe message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Unsubscribe
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): esp_control.Unsubscribe;

        /**
         * Verifies an Unsubscribe message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Unsubscribe message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Unsubscribe
         */
        public static fromObject(object: { [k: string]: any }): esp_control.Unsubscribe;

        /**
         * Creates a plain object from an Unsubscribe message. Also converts values to other types if specified.
         * @param message Unsubscribe
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: esp_control.Unsubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Unsubscribe to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Unsubscribe
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
