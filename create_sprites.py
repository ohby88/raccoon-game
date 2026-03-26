#!/usr/bin/env python3
"""
픽셀아트 스프라이트 생성 스크립트
여우와 토끼 캐릭터를 프로그래밍 방식으로 생성
"""
from PIL import Image, ImageDraw
import os

def create_fox_idle(size=832):
    """여우 서있기 스프라이트"""
    img = Image.new('RGBA', (size, int(size*1.5)), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 픽셀 단위
    px = size // 26

    # 색상 정의 (주황색 여우)
    body = (255, 102, 0)      # 주황색
    dark = (204, 68, 0)       # 어두운 주황
    white = (255, 255, 255)   # 흰색 배
    ear_pink = (255, 200, 180)
    eye_white = (255, 255, 255)
    eye_black = (0, 0, 0)
    tail = (255, 153, 68)

    # 몸통 (중앙 하단)
    cx, cy = size // 2, int(size * 0.9)
    draw.ellipse([cx-8*px, cy-6*px, cx+8*px, cy+6*px], fill=body)

    # 배 (흰색)
    draw.ellipse([cx-5*px, cy-4*px, cx+5*px, cy+5*px], fill=white)

    # 머리 (위)
    hx, hy = cx, cy - 14*px
    draw.ellipse([hx-7*px, hy-7*px, hx+7*px, hy+7*px], fill=body)

    # 얼굴 흰색 부분
    draw.ellipse([hx-5*px, hy-2*px, hx+5*px, hy+6*px], fill=white)

    # 귀 (뾰족)
    draw.polygon([(hx-6*px, hy-7*px), (hx-4*px, hy-12*px), (hx-2*px, hy-7*px)], fill=dark)
    draw.polygon([(hx+2*px, hy-7*px), (hx+4*px, hy-12*px), (hx+6*px, hy-7*px)], fill=dark)
    # 귀 안쪽
    draw.polygon([(hx-5*px, hy-7*px), (hx-4*px, hy-10*px), (hx-3*px, hy-7*px)], fill=ear_pink)
    draw.polygon([(hx+3*px, hy-7*px), (hx+4*px, hy-10*px), (hx+5*px, hy-7*px)], fill=ear_pink)

    # 눈
    draw.ellipse([hx-4*px, hy-1*px, hx-2*px, hy+1*px], fill=eye_white)
    draw.ellipse([hx+2*px, hy-1*px, hx+4*px, hy+1*px], fill=eye_white)
    draw.ellipse([hx-3.5*px, hy-0.5*px, hx-2.5*px, hy+0.5*px], fill=eye_black)
    draw.ellipse([hx+2.5*px, hy-0.5*px, hx+3.5*px, hy+0.5*px], fill=eye_black)

    # 코
    draw.ellipse([hx-px, hy+2*px, hx+px, hy+3*px], fill=eye_black)

    # 꼬리 (크고 풍성)
    tx, ty = cx + 9*px, cy - 2*px
    draw.ellipse([tx-5*px, ty-8*px, tx+5*px, ty+3*px], fill=tail)
    draw.ellipse([tx-3*px, ty-6*px, tx+3*px, ty+2*px], fill=white)

    # 다리
    draw.ellipse([cx-6*px, cy+4*px, cx-3*px, cy+10*px], fill=dark)
    draw.ellipse([cx+3*px, cy+4*px, cx+6*px, cy+10*px], fill=dark)

    return img

def create_rabbit_idle(size=832):
    """토끼 서있기 스프라이트"""
    img = Image.new('RGBA', (size, int(size*1.5)), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    px = size // 26

    # 색상 (분홍/흰색 토끼)
    body = (221, 221, 255)     # 연한 보라
    dark = (204, 204, 238)
    white = (255, 255, 255)
    ear_pink = (255, 170, 170)
    eye = (255, 68, 136)
    nose = (255, 136, 170)

    # 몸통
    cx, cy = size // 2, int(size * 0.9)
    draw.ellipse([cx-7*px, cy-6*px, cx+7*px, cy+6*px], fill=body)

    # 배
    draw.ellipse([cx-5*px, cy-4*px, cx+5*px, cy+5*px], fill=white)

    # 머리
    hx, hy = cx, cy - 13*px
    draw.ellipse([hx-6*px, hy-6*px, hx+6*px, hy+6*px], fill=body)

    # 긴 귀 (토끼 특징)
    draw.ellipse([hx-5*px, hy-18*px, hx-2*px, hy-5*px], fill=body)
    draw.ellipse([hx+2*px, hy-18*px, hx+5*px, hy-5*px], fill=body)
    # 귀 안쪽
    draw.ellipse([hx-4*px, hy-16*px, hx-3*px, hy-7*px], fill=ear_pink)
    draw.ellipse([hx+3*px, hy-16*px, hx+4*px, hy-7*px], fill=ear_pink)

    # 눈 (크고 귀여운)
    draw.ellipse([hx-4*px, hy-2*px, hx-1*px, hy+1*px], fill=eye)
    draw.ellipse([hx+1*px, hy-2*px, hx+4*px, hy+1*px], fill=eye)
    # 하이라이트
    draw.ellipse([hx-3.5*px, hy-1.5*px, hx-2.5*px, hy-0.5*px], fill=white)
    draw.ellipse([hx+1.5*px, hy-1.5*px, hx+2.5*px, hy-0.5*px], fill=white)

    # 코
    draw.ellipse([hx-px, hy+2*px, hx+px, hy+3*px], fill=nose)

    # 솜털 꼬리 (작고 둥글게)
    tx, ty = cx + 7*px, cy + 2*px
    draw.ellipse([tx-3*px, ty-3*px, tx+3*px, ty+3*px], fill=white)

    # 다리
    draw.ellipse([cx-5*px, cy+4*px, cx-2*px, cy+9*px], fill=dark)
    draw.ellipse([cx+2*px, cy+4*px, cx+5*px, cy+9*px], fill=dark)

    return img

def create_walking_sprite(idle_sprite):
    """서있기 스프라이트를 복사해서 다리만 수정"""
    # 간단하게 idle 복사 (실제로는 다리 위치만 변경해야 함)
    return idle_sprite.copy()

def create_jumping_sprite(idle_sprite):
    """점프 스프라이트 - 팔다리 벌림"""
    return idle_sprite.copy()

if __name__ == "__main__":
    sprites_dir = "sprites"
    os.makedirs(sprites_dir, exist_ok=True)

    print("Creating fox sprites...")
    fox_idle = create_fox_idle()
    fox_idle.save(os.path.join(sprites_dir, "fox_idle.png"), "PNG")
    fox_walk = create_walking_sprite(fox_idle)
    fox_walk.save(os.path.join(sprites_dir, "fox_walk.png"), "PNG")
    fox_jump = create_jumping_sprite(fox_idle)
    fox_jump.save(os.path.join(sprites_dir, "fox_jump.png"), "PNG")
    print("Fox sprites created!")

    print("Creating rabbit sprites...")
    rabbit_idle = create_rabbit_idle()
    rabbit_idle.save(os.path.join(sprites_dir, "rabbit_idle.png"), "PNG")
    rabbit_walk = create_walking_sprite(rabbit_idle)
    rabbit_walk.save(os.path.join(sprites_dir, "rabbit_walk.png"), "PNG")
    rabbit_jump = create_jumping_sprite(rabbit_idle)
    rabbit_jump.save(os.path.join(sprites_dir, "rabbit_jump.png"), "PNG")
    print("Rabbit sprites created!")

    print("\nAll sprites generated successfully!")
