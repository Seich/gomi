{ pkgs, lib, config, inputs, ... }:

# https://devenv.sh/basics/
{
  packages = [
    pkgs.vscode-langservers-extracted
    pkgs.prettierd
    pkgs.yaml-language-server
    pkgs.deno
  ];

  scripts.build.exec = "deno compile --allow-read --allow-write --allow-env --unstable-temporal --allow-net ./gomi.ts --output gomi";

}

