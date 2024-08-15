{ pkgs, lib, config, inputs, ... }:

# https://devenv.sh/basics/
{
  packages = [
    pkgs.vscode-langservers-extracted
    pkgs.prettierd
    pkgs.yaml-language-server
    pkgs.deno
  ];


}

