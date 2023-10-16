#!/usr/bin/env python3

import argparse
import base64
import qrcode
import os

from io import BytesIO

QRCODE_FORMAT = "WIFI:T:{network_encryption};S:{network_name};P:{network_password};;"

def create_qrcode(payload: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image()
    stream = BytesIO()
    img.save(stream)
    return base64.b64encode(stream.getvalue()).decode()

def main():
    parser = argparse.ArgumentParser(
        description="Generates a card with QRCode for Wi-Fi Connection.")
    parser.add_argument("network", help="Wi-Fi network name.")
    parser.add_argument("password", help="Wi-Fi network password.")
    parser.add_argument("-e", "--encryption", help="Wi-Fi encryption algorithm to use.",
                        default="WPA", choices=["WPA", "WEP"])
    parser.add_argument("-t", "--template", help="Template to use to generate the card.",
                        default="card-template.svg")
    parser.add_argument("-o", "--output", help="File name where the new card will be saved.",
                        default="new-card.svg")
    args = parser.parse_args()

    wifi_qrcode_text = QRCODE_FORMAT.replace(
        "{network_encryption}", args.encryption).replace(
        "{network_name}", args.network).replace(
        "{network_password}", args.password)

    qr_img_b64 = create_qrcode(wifi_qrcode_text)
    qr_image = "data:image/png;base64," + qr_img_b64

    template = os.path.join("templates", args.template)
    with open(template, "r") as svg:
        svg_contents = svg.read().replace(
            "qrcode-placeholder.png", qr_image).replace(
            "{network_name}", args.network).replace(
            "{network_password}", args.password)

    with open(args.output, "w") as new_card:
        new_card.write(svg_contents)

    print(f"Saved card to {args.output}")

if __name__ == "__main__":
    main()
