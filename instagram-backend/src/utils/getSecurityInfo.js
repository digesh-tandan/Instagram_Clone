const geoip =
require("geoip-lite");

const UAParser =
require("ua-parser-js");

const getSecurityInfo = (req) => {
    // GET RAW IP
    let ipAddress =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        req.ip ||
        "Unknown";
    // HANDLE ARRAY OF IPS
    if (
        ipAddress.includes(",")
    ) {
        ipAddress =
        ipAddress
        .split(",")[0]
        .trim();
    }
    // CLEAN IPV6 LOCALHOST
    if (
        ipAddress === "::1"
    ) {
        ipAddress =
        "127.0.0.1";
    }
    // REMOVE IPV6 PREFIX
    if (
        ipAddress.startsWith(
            "::ffff:"
        )
    ) {
        ipAddress =
        ipAddress.replace(
            "::ffff:",
            ""
        );
    }
    // USER AGENT
    const userAgent =
    req.headers["user-agent"] || "";

    const parser =
    new UAParser(
        userAgent
    );

    const browserData =
    parser.getBrowser();

    const osData =
    parser.getOS();

    const deviceData =
    parser.getDevice();

    const browser =
        browserData.name
        ?
        `${browserData.name} ${browserData.version || ""}`
        :
        "Unknown Browser";
    const os =
        osData.name
        ?
        `${osData.name} ${osData.version || ""}`
        :
        "Unknown OS";

    const device =
        deviceData.vendor ||
        deviceData.model ||
        "Desktop";

    // GEO LOCATION
    let location =
    "Unknown Location";

    // SKIP LOCALHOST LOCATION

    const localIPs = [
        "127.0.0.1",
        "localhost"
    ];

    if (
        !localIPs.includes(
            ipAddress
        )
    ) {

        const geo =
        geoip.lookup(
            ipAddress
        );

        if (geo) {

            location = `

                ${geo.city || "Unknown City"},

                ${geo.region || "Unknown Region"},

                ${geo.country || "Unknown Country"}

            `.replace(/\s+/g, " ").trim();
        }
    }

    return {

        ipAddress,

        browser,

        os,

        device,

        location
    };
};

module.exports =
getSecurityInfo;