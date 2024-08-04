{ pkgs, lib, config, inputs, ... }:

# https://devenv.sh/basics/
{
  packages = [
    pkgs.vscode-langservers-extracted
    pkgs.nodePackages.typescript-language-server
    pkgs.prettierd
    pkgs.caddy
    pkgs.bun
  ];

  languages.deno = {
    enable = true;
  };

  scripts.build.exec = "deno compile --allow-read --allow-write --allow-env --unstable-temporal --allow-net ./gomi.ts --output gomi";

}

