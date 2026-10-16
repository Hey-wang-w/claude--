#!/usr/bin/env bash
# 发布 Artifact 前去掉文档外壳（doctype / html / head / body / meta 行），平台会自动补上。
# 用法：bash strip_for_artifact.sh <课件 index.html> <输出到 scratchpad 的文件>
set -e
grep -vE '^<!DOCTYPE html>$|^<html lang="zh-CN">$|^</?head>$|^<meta charset|^<meta name="viewport"|^</?body>$|^</html>$' "$1" > "$2"
wc -c "$2"
