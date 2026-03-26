#!/usr/bin/env python3
"""
이미지 배경 제거 스크립트
흰색 배경을 투명하게 만들고 PNG로 저장
"""
from PIL import Image
import os

def remove_white_background(input_path, output_path, tolerance=30):
    """
    흰색 배경을 투명하게 만들기

    Args:
        input_path: 입력 이미지 경로
        output_path: 출력 이미지 경로 (PNG)
        tolerance: 흰색 허용 오차 (0-255, 클수록 더 많은 색상 제거)
    """
    # 이미지 열기
    img = Image.open(input_path).convert("RGBA")

    # 픽셀 데이터 가져오기
    data = img.getdata()

    new_data = []
    for item in data:
        # RGB 값이 모두 (255-tolerance) 이상이면 투명하게
        if item[0] >= 255 - tolerance and item[1] >= 255 - tolerance and item[2] >= 255 - tolerance:
            # 완전 투명
            new_data.append((255, 255, 255, 0))
        else:
            # 원본 유지
            new_data.append(item)

    # 새로운 데이터 적용
    img.putdata(new_data)

    # PNG로 저장
    img.save(output_path, "PNG")
    print(f"OK: {input_path} -> {output_path}")

if __name__ == "__main__":
    # sprites 폴더의 모든 JPG 파일 처리
    sprites_dir = "sprites"

    files = [
        ("raccoon_idle.jpg", "raccoon_idle.png"),
        ("raccoon_walk.jpg", "raccoon_walk.png"),
        ("raccoon_jump.jpg", "raccoon_jump.png"),
    ]

    for jpg_file, png_file in files:
        input_path = os.path.join(sprites_dir, jpg_file)
        output_path = os.path.join(sprites_dir, png_file)

        if os.path.exists(input_path):
            remove_white_background(input_path, output_path, tolerance=40)
        else:
            print(f"Not found: {input_path}")

    print("\nAll images converted!")
